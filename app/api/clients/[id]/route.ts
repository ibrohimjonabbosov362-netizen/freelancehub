import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CLIENT_STATUSES, type ClientStatus } from "@/lib/statuses";

/** Bo'sh satrni null ga aylantiradi — bazada "" saqlanmasin */
function optionalText(value: unknown, max = 500): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }
  const { id } = await params;

  const client = await prisma.client.findFirst({
    where: { id, userId },
    include: {
      proposals: { orderBy: { createdAt: "desc" } },
      projects: {
        orderBy: { createdAt: "desc" },
        // Mijoz sahifasidagi daromad va to'lovlar shu yerdan hisoblanadi
        include: { payments: { orderBy: { dueDate: "asc" } } },
      },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Mijoz topilmadi" }, { status: 404 });
  }

  return NextResponse.json(client);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { id } = await params;
  const { name, email, company, phone, status, notes } = await request.json();

  if (!name || !email) {
    return NextResponse.json(
      { error: "Ism va email kiritilishi shart" },
      { status: 400 }
    );
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return NextResponse.json({ error: "Email manzili noto'g'ri" }, { status: 400 });
  }

  const existing = await prisma.client.findFirst({ where: { id, userId } });

  if (!existing) {
    return NextResponse.json({ error: "Mijoz topilmadi" }, { status: 404 });
  }

  const client = await prisma.client.update({
    where: { id },
    data: {
      name: String(name).trim().slice(0, 120),
      email: normalizedEmail,
      company: optionalText(company, 120),
      phone: optionalText(phone, 40),
      notes: optionalText(notes, 2000),
      // Holat yuborilmasa avvalgisi saqlanadi
      status: CLIENT_STATUSES.includes(status as ClientStatus)
        ? (status as ClientStatus)
        : existing.status,
    },
  });

  return NextResponse.json(client);
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

  const client = await prisma.client.findFirst({ where: { id, userId } });

  if (!client) {
    return NextResponse.json({ error: "Mijoz topilmadi" }, { status: 404 });
  }

  await prisma.client.delete({ where: { id } });

  return NextResponse.json({ success: true });
}