import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { syncOverduePayments } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

const MAX_AMOUNT = 9_999_999_999.99; // schema: Decimal(12, 2)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { id } = await params;

  const project = await prisma.project.findFirst({ where: { id, userId } });

  if (!project) {
    return NextResponse.json({ error: "Loyiha topilmadi" }, { status: 404 });
  }

  await syncOverduePayments(userId);

  const payments = await prisma.payment.findMany({
    where: { projectId: id },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(payments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { id } = await params;
  const { amount, dueDate } = await request.json();

  if (amount === undefined || amount === null || amount === "" || !dueDate) {
    return NextResponse.json(
      { error: "Summa va to'lov muddati kiritilishi shart" },
      { status: 400 }
    );
  }

  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json(
      { error: "Summa musbat son bo'lishi kerak" },
      { status: 400 }
    );
  }

  if (parsedAmount > MAX_AMOUNT) {
    return NextResponse.json({ error: "Summa juda katta" }, { status: 400 });
  }

  const parsedDate = new Date(dueDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "Sana noto'g'ri" }, { status: 400 });
  }

  const project = await prisma.project.findFirst({ where: { id, userId } });

  if (!project) {
    return NextResponse.json({ error: "Loyiha topilmadi" }, { status: 404 });
  }

  const payment = await prisma.payment.create({
    data: {
      projectId: id,
      amount: parsedAmount.toFixed(2),
      dueDate: parsedDate,
      // Muddati allaqachon o'tgan bo'lsa darhol OVERDUE deb belgilaymiz.
      status: parsedDate.getTime() < Date.now() ? "OVERDUE" : "PENDING",
    },
  });

  return NextResponse.json(payment, { status: 201 });
}
