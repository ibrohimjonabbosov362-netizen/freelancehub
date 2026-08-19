import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PAYMENT_STATUSES, type PaymentStatus } from "@/lib/statuses";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  if (!PAYMENT_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Noto'g'ri holat" }, { status: 400 });
  }

  // To'lov shu foydalanuvchining loyihasiga tegishlimi?
  const payment = await prisma.payment.findFirst({
    where: { id, project: { userId } },
  });

  if (!payment) {
    return NextResponse.json({ error: "To'lov topilmadi" }, { status: 404 });
  }

  const updated = await prisma.payment.update({
    where: { id },
    data: {
      status: status as PaymentStatus,
      // "To'landi" belgilansa sana qo'yiladi, qaytarib olinsa tozalanadi.
      paidAt: status === "PAID" ? new Date() : null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { id } = await params;

  const payment = await prisma.payment.findFirst({
    where: { id, project: { userId } },
  });

  if (!payment) {
    return NextResponse.json({ error: "To'lov topilmadi" }, { status: 404 });
  }

  await prisma.payment.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
