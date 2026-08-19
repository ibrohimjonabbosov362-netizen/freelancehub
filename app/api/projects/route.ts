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

  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      client: true,
      payments: {
        select: { amount: true, status: true, dueDate: true },
        orderBy: { dueDate: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    projects.map(({ payments, ...project }) => ({
      ...project,
      paidTotal: payments
        .filter((p) => p.status === "PAID")
        .reduce((sum, p) => sum + Number(p.amount), 0),
      dueTotal: payments.reduce((sum, p) => sum + Number(p.amount), 0),
      nextDueDate:
        payments.find((p) => p.status !== "PAID")?.dueDate?.toISOString() ?? null,
    }))
  );
}
