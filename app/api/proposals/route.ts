import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const proposals = await prisma.proposal.findMany({
    where: { userId },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(proposals);
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { clientId, title, description, amount } = await request.json();

  if (!clientId || !title || amount === undefined || amount === null || amount === "") {
    return NextResponse.json(
      { error: "Mijoz, sarlavha va summa kiritilishi shart" },
      { status: 400 }
    );
  }

  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
    return NextResponse.json(
      { error: "Summa musbat son bo'lishi kerak" },
      { status: 400 }
    );
  }

  // Decimal(12, 2) — schema chegarasidan oshib ketmasligi uchun
  if (parsedAmount > 9_999_999_999.99) {
    return NextResponse.json({ error: "Summa juda katta" }, { status: 400 });
  }

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId },
  });

  if (!client) {
    return NextResponse.json({ error: "Mijoz topilmadi" }, { status: 404 });
  }

  try {
    const proposal = await prisma.proposal.create({
      data: {
        title: String(title).trim(),
        description: description ? String(description).trim() : null,
        amount: parsedAmount.toFixed(2),
        clientId,
        userId,
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error("Proposal create error:", error);
    return NextResponse.json(
      { error: "Taklifni saqlab bo'lmadi" },
      { status: 500 }
    );
  }
}