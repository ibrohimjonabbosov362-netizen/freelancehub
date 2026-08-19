import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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
      projects: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Mijoz topilmadi" }, { status: 404 });
  }

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