import { redirect } from "next/navigation";
import AppShell from "../AppShell";
import DashboardView, { type DashboardData } from "./DashboardView";
import { getCurrentUserId } from "@/lib/session";
import { syncOverduePayments } from "@/lib/payments";
import { getPlanInfo } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import type { PaymentStatus, ProjectStatus } from "@/lib/statuses";

export async function generateMetadata() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  return pageMetadata(
    "/dashboard",
    t.nav.dashboard,
    locale === "en"
      ? "See your freelance business performance at a glance."
      : "Biznesingiz holatini bir qarashda ko'ring.",
    { index: false }
  );
}

function trendPercent(weeks: number[]): number | null {
  const recent = weeks.slice(3).reduce((a, b) => a + b, 0);
  const earlier = weeks.slice(0, 3).reduce((a, b) => a + b, 0);

  if (earlier === 0) return recent > 0 ? 100 : null;
  return Math.round(((recent - earlier) / earlier) * 100);
}

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
  const dictionary = await getDictionary();
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

  const [
    user,
    planInfo,
    clientsCount,
    activeProjectsCount,
    proposals,
    paidPayments,
    monthPaid,
    clients,
    payments,
    pendingTotal,
    recentProjects,
    recentProposals,
    recentPaid,
  ] =
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
      // To'lanmagan (kutilayotgan + muddati o'tgan) summa
      prisma.payment.aggregate({
        where: { status: { not: "PAID" }, project: { userId } },
        _sum: { amount: true },
      }),
      prisma.project.findMany({
        where: { userId },
        include: {
          client: { select: { name: true } },
          payments: { select: { amount: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.proposal.findMany({
        where: { userId },
        select: { id: true, title: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.payment.findMany({
        where: { status: "PAID", project: { userId } },
        select: { id: true, amount: true, paidAt: true },
        orderBy: { paidAt: "desc" },
        take: 5,
      }),
    ]);

  const byStatus = (status: string) =>
    proposals.filter((p) => p.status === status);

  const proposalTiles = [
    { key: "SENT" as const, color: "var(--viz-1)", href: "/proposals" },
    { key: "ACCEPTED" as const, color: "var(--viz-2)", href: "/projects" },
    { key: "DRAFT" as const, color: "var(--viz-3)", href: "/proposals" },
  ].map((tile) => {
    const rows = byStatus(tile.key);
    const trend = weeklyTrend(rows.map((r) => r.createdAt));
    return { ...tile, count: rows.length, trend, change: trendPercent(trend) };
  });

  // Oxirgi 6 oyni nol bilan to'ldirib, to'lovlarni ustiga yozamiz
  const revenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(sixMonthsAgo);
    d.setMonth(d.getMonth() + i);
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: dictionary.dashboard.months[d.getMonth()],
      value: 0,
    };
  });

  for (const payment of paidPayments) {
    if (!payment.paidAt) continue;
    const key = `${payment.paidAt.getFullYear()}-${payment.paidAt.getMonth()}`;
    const bucket = revenue.find((r) => r.key === key);
    if (bucket) bucket.value += Number(payment.amount);
  }

  // Harakatlar tasmasi: turli manbalarni bitta ro'yxatga qo'shib, sanaga qarab saralaymiz
  const activity: DashboardData["activity"] = [
    ...clients.map((c) => ({
      id: `client-${c.id}`,
      kind: "client" as const,
      text: c.name,
      href: `/clients/${c.id}`,
      at: c.createdAt.toISOString(),
    })),
    ...recentProposals.map((p) => ({
      id: `proposal-${p.id}`,
      kind: "proposal" as const,
      text: p.title,
      href: "/proposals",
      at: p.createdAt.toISOString(),
    })),
    ...recentProjects.map((p) => ({
      id: `project-${p.id}`,
      kind: "project" as const,
      text: p.title,
      href: `/projects/${p.id}`,
      at: p.createdAt.toISOString(),
    })),
    ...recentPaid
      .filter((p) => p.paidAt)
      .map((p) => ({
        id: `payment-${p.id}`,
        kind: "payment" as const,
        text: p.amount.toString(),
        href: "/payments",
        at: p.paidAt!.toISOString(),
      })),
  ]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 8);

  const data: DashboardData = {
    name: user?.name ?? "",
    isPremium: planInfo.isPremium,
    clientsCount,
    activeProjectsCount,
    monthlyEarnings: Number(monthPaid._sum.amount ?? 0),
    pendingTotal: Number(pendingTotal._sum.amount ?? 0),
    activity,
    projects: recentProjects.map((p) => ({
      id: p.id,
      title: p.title,
      clientName: p.client.name,
      status: p.status as ProjectStatus,
      deadline: p.deadline?.toISOString() ?? null,
      paidTotal: p.payments
        .filter((x) => x.status === "PAID")
        .reduce((sum, x) => sum + Number(x.amount), 0),
      total: p.payments.reduce((sum, x) => sum + Number(x.amount), 0),
    })),
    proposalTiles,
    revenue: revenue.map(({ label, value }) => ({ label, value })),
    clients: clients.map((c) => ({
      id: c.id,
      name: c.name,
      company: c.company,
      email: c.email,
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
