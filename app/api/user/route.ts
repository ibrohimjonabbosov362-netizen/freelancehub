import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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
    const trimmed = String(name).trim();

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

    // Sessiya o'g'irlangan bo'lsa ham parolni almashtirib bo'lmasin
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
