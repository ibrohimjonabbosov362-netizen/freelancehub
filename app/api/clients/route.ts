import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { FREE_CLIENT_LIMIT, getPlanInfo } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import { CLIENT_STATUSES, type ClientStatus } from "@/lib/statuses";

function parseStatus(value: unknown): ClientStatus {
  return CLIENT_STATUSES.includes(value as ClientStatus)
    ? (value as ClientStatus)
    : "ACTIVE";
}

/** Bo'sh satrni null ga aylantiradi — bazada "" saqlanmasin */
function optionalText(value: unknown, max = 500): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  // Ro'yxatda loyiha soni va to'langan summa ham ko'rsatiladi
  const [clients, paidPayments] = await Promise.all([
    prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { projects: true, proposals: true } } },
    }),
    prisma.payment.findMany({
      where: { status: "PAID", project: { userId } },
      select: { amount: true, project: { select: { clientId: true } } },
    }),
  ]);

  const revenueByClient = new Map<string, number>();

  for (const payment of paidPayments) {
    const clientId = payment.project.clientId;
    revenueByClient.set(
      clientId,
      (revenueByClient.get(clientId) ?? 0) + Number(payment.amount)
    );
  }

  return NextResponse.json(
    clients.map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      company: client.company,
      phone: client.phone,
      status: client.status,
      notes: client.notes,
      createdAt: client.createdAt.toISOString(),
      projectsCount: client._count.projects,
      proposalsCount: client._count.proposals,
      revenue: revenueByClient.get(client.id) ?? 0,
    }))
  );
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { name, email, company, phone, status, notes } = await request.json();

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
        code: "FREE_LIMIT",
        limit: FREE_CLIENT_LIMIT,
      },
      { status: 403 }
    );
  }

  const client = await prisma.client.create({
    data: {
      name: String(name).trim().slice(0, 120),
      email: normalizedEmail,
      company: optionalText(company, 120),
      phone: optionalText(phone, 40),
      notes: optionalText(notes, 2000),
      status: parseStatus(status),
      userId,
    },
  });

  return NextResponse.json(client, { status: 201 });
}
