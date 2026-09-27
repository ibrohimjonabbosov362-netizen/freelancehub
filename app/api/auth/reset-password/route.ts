import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await rateLimit(`reset:${clientIp(request)}`, 10, 15 * 60 * 1000)).ok) {
    return NextResponse.json({ error: "Juda ko'p urinish." }, { status: 429 });
  }

  const { token, password } = await request.json();

  if (!token || typeof password !== "string" || password.length < 6) {
    return NextResponse.json(
      { error: "Parol kamida 6 belgidan iborat bo'lishi kerak" },
      { status: 400 }
    );
  }

  const tokenHash = createHash("sha256").update(String(token)).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Havola eskirgan yoki yaroqsiz. Qaytadan so'rov yuboring." },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: await bcrypt.hash(password, 10) },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Qolgan barcha tiklash havolalari ham kuchini yo'qotsin
    prisma.passwordResetToken.deleteMany({
      where: { userId: record.userId, usedAt: null },
    }),
  ]);

  return NextResponse.json({ success: true });
}
