import { redirect } from "next/navigation";
import AppShell from "../AppShell";
import DashboardView, { type DashboardData } from "./DashboardView";
import { getCurrentUserId } from "@/lib/session";
import { syncOverduePayments } from "@/lib/payments";
import { getPlanInfo } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import type { PaymentStatus, ProjectStatus } from "@/lib/statuses";

export const metadata = { title: "Boshqaruv paneli" };

const MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

function weeklyTrend(dates: Date[]): number[] {
  const week = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  return Array.from({ length: 6 }, (_, i) => {
    const from = now - (6 - i) * week;
    const to = now - (5 - i) * week;
    return dates.filter((d) => d.getTime() >= from && d.getTime() < to).length;
  });
}

export default async function DashboardPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/login");
  }

  await syncOverduePayments(userId);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5, 1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [user, planInfo, clientsCount, activeProjectsCount, proposals, paidPayments, monthPaid, clients, payments] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
      getPlanInfo(userId),
      prisma.client.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: "IN_PROGRESS" } }),
      prisma.proposal.findMany({
        where: { userId },
        select: { status: true, createdAt: true },
      }),
      prisma.payment.findMany({
        where: { status: "PAID", paidAt: { gte: sixMonthsAgo }, project: { userId } },
        select: { amount: true, paidAt: true },
      }),
      prisma.payment.aggregate({
        where: { status: "PAID", paidAt: { gte: monthStart }, project: { userId } },
        _sum: { amount: true },
      }),
      prisma.client.findMany({
        where: { userId },
        include: {
          projects: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { title: true, status: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.payment.findMany({
        where: { project: { userId } },
        include: {
          project: { select: { id: true, title: true, client: { select: { name: true } } } },
        },
        orderBy: { dueDate: "desc" },
        take: 5,
      }),
    ]);

  const byStatus = (status: string) =>
    proposals.filter((p) => p.status === status);

  const proposalTiles = [
    { key: "SENT", label: "Yuborilgan", color: "var(--viz-1)" },
    { key: "ACCEPTED", label: "Qabul qilingan", color: "var(--viz-2)" },
    { key: "DRAFT", label: "Qoralama", color: "var(--viz-3)" },
  ].map((tile) => {
    const rows = byStatus(tile.key);
    return {
      ...tile,
      count: rows.length,
      trend: weeklyTrend(rows.map((r) => r.createdAt)),
    };
  });

  // Oxirgi 6 oyni nol bilan to'ldirib, to'lovlarni ustiga yozamiz
  const revenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(sixMonthsAgo);
    d.setMonth(d.getMonth() + i);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS[d.getMonth()], value: 0 };
  });

  for (const payment of paidPayments) {
    if (!payment.paidAt) continue;
    const key = `${payment.paidAt.getFullYear()}-${payment.paidAt.getMonth()}`;
    const bucket = revenue.find((r) => r.key === key);
    if (bucket) bucket.value += Number(payment.amount);
  }

  const data: DashboardData = {
    name: user?.name ?? "",
    isPremium: planInfo.isPremium,
    clientsCount,
    activeProjectsCount,
    monthlyEarnings: Number(monthPaid._sum.amount ?? 0),
    proposalTiles,
    revenue: revenue.map(({ label, value }) => ({ label, value })),
    clients: clients.map((c) => ({
      id: c.id,
      name: c.name,
      company: c.company,
      projectTitle: c.projects[0]?.title ?? null,
      status: (c.projects[0]?.status as ProjectStatus) ?? null,
    })),
    payments: payments.map((p) => ({
      id: p.id,
      projectId: p.project.id,
      projectTitle: p.project.title,
      clientName: p.project.client.name,
      amount: p.amount.toString(),
      status: p.status as PaymentStatus,
      dueDate: p.dueDate.toISOString(),
    })),
  };

  return (
    <AppShell>
      <DashboardView data={data} />
    </AppShell>
  );
}
