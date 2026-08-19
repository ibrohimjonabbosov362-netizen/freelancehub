import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { syncOverduePayments } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  await syncOverduePayments(userId);

  const status = new URL(request.url).searchParams.get("status");
  const valid = ["PENDING", "PAID", "OVERDUE"];

  const payments = await prisma.payment.findMany({
    where: {
      project: { userId },
      ...(status && valid.includes(status) ? { status: status as never } : {}),
    },
    include: {
      project: {
        select: { id: true, title: true, client: { select: { name: true } } },
      },
    },
    orderBy: { dueDate: "desc" },
  });

  const totals = payments.reduce(
    (acc, p) => {
      const amount = Number(p.amount);
      acc.all += amount;
      if (p.status === "PAID") acc.paid += amount;
      else acc.outstanding += amount;
      if (p.status === "OVERDUE") acc.overdue += amount;
      return acc;
    },
    { all: 0, paid: 0, outstanding: 0, overdue: 0 }
  );

  return NextResponse.json({
    totals,
    payments: payments.map((p, i) => ({
      id: p.id,
      // Hisob-faktura raqami: eng eskisi #1001 dan boshlanadi
      invoiceNo: 1000 + payments.length - i,
      amount: p.amount.toString(),
      dueDate: p.dueDate.toISOString(),
      paidAt: p.paidAt?.toISOString() ?? null,
      status: p.status,
      projectId: p.project.id,
      projectTitle: p.project.title,
      clientName: p.project.client.name,
    })),
  });
}
