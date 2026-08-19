import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  // Bitta IP soatiga 5 tadan ortiq hisob ocholmasin
  const limit = rateLimit(`register:${clientIp(request)}`, 5, 60 * 60 * 1000);

  if (!limit.ok) {
    return NextResponse.json(
      { error: "Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Parol kamida 6 belgidan iborat bo'lishi kerak" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: "Email manzili noto'g'ri" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existingUser) {
      return NextResponse.json({ error: "Bu email bilan foydalanuvchi allaqachon mavjud" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashedPassword,
        subscription: { create: { plan: "FREE" } },
      },
    });

    return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Server xatosi, keyinroq urinib ko'ring" }, { status: 500 });
  }
}
