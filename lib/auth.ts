import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIpFromHeaders } from "@/lib/rateLimit";

export function isGoogleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/**
 * Token'ni parolga bog'laydigan belgi. Parol almashganda (yoki hisob o'chirilganda)
 * belgi ham o'zgaradi, shuning uchun o'sha paytgacha berilgan tokenlar kuchini
 * yo'qotadi — o'g'irlangan sessiya parol almashtirilgandan keyin ham 30 kun
 * ishlab turavermasin. Token ichiga parolning o'zi tushmaydi.
 */
function passwordMarker(password: string | null): string {
  return password ? createHash("sha256").update(password).digest("hex").slice(0, 16) : "none";
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  // Cookie prefiksi HTTPS'ga qarab tanlanadi, NODE_ENV'ga emas. Bu yerdagi
  // mantiq next-auth'ning getToken() mantiqi bilan **aynan bir xil** bo'lishi
  // shart: proxy (middleware) tokenni o'sha qoida bo'yicha qidiradi. Farq
  // bo'lsa, cookie yozilgani bilan topilmaydi va foydalanuvchi har safar
  // /login ga qaytariladi. NEXTAUTH_URL berilmasa Vercel'ni hisobga olamiz —
  // getToken ham aynan shunday qiladi.
  useSecureCookies:
    process.env.NEXTAUTH_URL?.startsWith("https://") ??
    Boolean(process.env.VERCEL),
  pages: {
    signIn: "/login",
  },
  providers: [
    // Kalitlar berilmagan bo'lsa Google tugmasi umuman chiqmaydi
    ...(isGoogleConfigured()
      ? [
          // allowDangerousEmailAccountLinking QASDDAN yoqilmagan: aks holda kimdir
          // sizning emailingiz bilan avval parol orqali soxta hisob ochib qo'ysa,
          // siz keyinroq "Google orqali kirish"ni bosganingizda NextAuth sizning
          // Google identifikatoringizni o'sha begona hisobga ulab qo'yar edi — u
          // odam esa hali ham o'zi qo'ygan parol bilan hisobingizga kira olardi.
          // Email hali tasdiqlanish (emailVerified) oqimi yo'q ekan, bu bayroq
          // yoqilishi mumkin emas.
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Parol", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const ip = clientIpFromHeaders(req.headers);

        // Bir email uchun 15 daqiqada 10 ta urinish, bitta IP uchun esa 30 ta —
        // aks holda bitta IP'dan ko'plab turli email bilan credential-stuffing
        // hech qanday chegarasiz qilinishi mumkin edi.
        if (
          !(await rateLimit(`login:${email}`, 10, 15 * 60 * 1000)).ok ||
          !(await rateLimit(`login-ip:${ip}`, 30, 15 * 60 * 1000)).ok
        ) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // Parolsiz hisob = Google orqali ochilgan, credentials bilan kirilmaydi
        if (!user?.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      // Google orqali kirilganda id token'da bo'lmasligi mumkin
      if (!token.id && !token.revoked && token.email) {
        const existing = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true },
        });
        if (existing) token.id = existing.id;
      }

      const tokenUserId = typeof token.id === "string" ? token.id : null;

      if (tokenUserId) {
        try {
          const current = await prisma.user.findUnique({
            where: { id: tokenUserId },
            select: { password: true },
          });

          if (!current) {
            // Hisob o'chirilgan — token endi hech narsaga bog'lanmaydi
            token.revoked = true;
          } else {
            const marker = passwordMarker(current.password);

            if (token.pwdv === undefined) {
              // Bu tekshiruv qo'shilishidan oldin berilgan tokenlar joriy
              // holatga moslanadi — hamma bir yo'la tizimdan chiqib qolmasin.
              token.pwdv = marker;
            } else if (token.pwdv !== marker) {
              token.revoked = true;
            }
          }
        } catch (error) {
          // Baza javob bermasa sessiyani o'chirmaymiz — aks holda kichik
          // uzilish barcha foydalanuvchini tizimdan chiqarib yuborardi.
          console.error("Sessiya tekshiruvi bajarilmadi:", error);
        }
      }

      // Bekor qilingan tokenda id qolmaydi: getCurrentUserId() null qaytaradi,
      // ya'ni bu sessiya hech qanday so'rovga ruxsat bermaydi.
      if (token.revoked) delete token.id;

      return token;
    },

    async signIn({ user }) {
      // Google orqali birinchi marta kirgan foydalanuvchiga bepul obuna ochamiz
      if (user?.id) {
        await prisma.subscription.upsert({
          where: { userId: user.id },
          create: { userId: user.id, plan: "FREE" },
          update: {},
        });
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};
