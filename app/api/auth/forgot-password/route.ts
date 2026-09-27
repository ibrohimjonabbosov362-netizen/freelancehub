import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { isMailConfigured, passwordResetMail, sendMail } from "@/lib/mail";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await rateLimit(`forgot:${clientIp(request)}`, 5, 15 * 60 * 1000)).ok) {
    return NextResponse.json(
      { error: "Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring." },
      { status: 429 }
    );
  }

  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email kiritilishi shart" }, { status: 400 });
  }

  if (!isMailConfigured()) {
    return NextResponse.json(
      { error: "Email xizmati sozlanmagan. Administrator bilan bog'laning." },
      { status: 503 }
    );
  }

  const normalized = String(email).trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });

  // Hisob bor-yo'qligini oshkor qilmaymiz — javob har doim bir xil
  if (user?.password) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await sendMail(passwordResetMail(user.email, token));
  }

  return NextResponse.json({
    message: "Agar bu email bilan hisob mavjud bo'lsa, tiklash havolasi yuborildi.",
  });
}
