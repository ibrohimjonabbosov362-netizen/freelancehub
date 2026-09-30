import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const [user, counts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    }),
    Promise.all([
      prisma.client.count({ where: { userId } }),
      prisma.proposal.count({ where: { userId } }),
      prisma.project.count({ where: { userId } }),
    ]),
  ]);

  if (!user) {
    return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
  }

  return NextResponse.json({
    ...user,
    clients: counts[0],
    proposals: counts[1],
    projects: counts[2],
  });
}

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { name, currentPassword, newPassword } = await request.json();

  if (name !== undefined) {
    // Ism butun interfeys bo'ylab (yon panel, shartnoma, PDF) ko'rinadi —
    // shuning uchun uzunlikni ham shu yerda cheklaymiz.
    const trimmed = String(name).trim().slice(0, 120);

    if (!trimmed) {
      return NextResponse.json({ error: "Ism bo'sh bo'lishi mumkin emas" }, { status: 400 });
    }

    await prisma.user.update({ where: { id: userId }, data: { name: trimmed } });
    return NextResponse.json({ success: true });
  }

  if (newPassword !== undefined) {
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Yangi parol kamida 6 belgidan iborat bo'lishi kerak" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Hisobingiz Google orqali ochilgan — parol o'rnatilmagan" },
        { status: 400 }
      );
    }

    // Sessiya o'g'irlangan bo'lsa ham joriy parolni cheksiz sinab bo'lmasin
    if (!(await rateLimit(`change-password:${userId}`, 5, 15 * 60 * 1000)).ok) {
      return NextResponse.json(
        { error: "Juda ko'p urinish. Birozdan so'ng qayta urinib ko'ring." },
        { status: 429 }
      );
    }

    const valid = await bcrypt.compare(String(currentPassword ?? ""), user.password);

    if (!valid) {
      return NextResponse.json({ error: "Joriy parol noto'g'ri" }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "O'zgartirish uchun maydon berilmadi" }, { status: 400 });
}
