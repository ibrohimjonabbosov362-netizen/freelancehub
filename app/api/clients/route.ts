import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { FREE_CLIENT_LIMIT, getPlanInfo } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const clients = await prisma.client.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { name, email, company } = await request.json();

  if (!name || !email) {
    return NextResponse.json(
      { error: "Ism va email kiritilishi shart" },
      { status: 400 }
    );
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return NextResponse.json(
      { error: "Email manzili noto'g'ri" },
      { status: 400 }
    );
  }

  const [{ isPremium }, clientCount] = await Promise.all([
    getPlanInfo(userId),
    prisma.client.count({ where: { userId } }),
  ]);

  if (!isPremium && clientCount >= FREE_CLIENT_LIMIT) {
    return NextResponse.json(
      {
        error: `Bepul tarifda ${FREE_CLIENT_LIMIT} tadan ortiq mijoz qo'sha olmaysiz. Premium'ga o'ting.`,
      },
      { status: 403 }
    );
  }

  const client = await prisma.client.create({
    data: {
      name: String(name).trim(),
      email: normalizedEmail,
      company: company ? String(company).trim() : null,
      userId,
    },
  });

  return NextResponse.json(client, { status: 201 });
}
