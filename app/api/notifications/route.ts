import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { syncOverduePayments } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  await syncOverduePayments(userId);

  const soon = new Date();
  soon.setDate(soon.getDate() + 7);

  const [overdue, dueSoon] = await Promise.all([
    prisma.payment.count({ where: { status: "OVERDUE", project: { userId } } }),
    prisma.payment.count({
      where: { status: "PENDING", dueDate: { lte: soon }, project: { userId } },
    }),
  ]);

  return NextResponse.json({ overdue, dueSoon, total: overdue + dueSoon });
}
