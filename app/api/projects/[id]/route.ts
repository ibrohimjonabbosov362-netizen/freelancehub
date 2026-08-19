import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { syncOverduePayments } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/statuses";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { id } = await params;

  await syncOverduePayments(userId);

  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: {
      client: true,
      proposal: true,
      contract: true,
      payments: { orderBy: { dueDate: "asc" } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Loyiha topilmadi" }, { status: 404 });
  }

  return NextResponse.json(project);
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
  const { status, title } = await request.json();

  if (status !== undefined && !PROJECT_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Noto'g'ri holat" }, { status: 400 });
  }

  if (title !== undefined && !String(title).trim()) {
    return NextResponse.json(
      { error: "Sarlavha bo'sh bo'lishi mumkin emas" },
      { status: 400 }
    );
  }

  if (status === undefined && title === undefined) {
    return NextResponse.json(
      { error: "O'zgartirish uchun maydon berilmadi" },
      { status: 400 }
    );
  }

  const existing = await prisma.project.findFirst({ where: { id, userId } });

  if (!existing) {
    return NextResponse.json({ error: "Loyiha topilmadi" }, { status: 404 });
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status: status as ProjectStatus } : {}),
      ...(title !== undefined ? { title: String(title).trim() } : {}),
    },
    include: { client: true },
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

  const existing = await prisma.project.findFirst({ where: { id, userId } });

  if (!existing) {
    return NextResponse.json({ error: "Loyiha topilmadi" }, { status: 404 });
  }

  // Shartnoma va to'lovlar schema'dagi onDelete: Cascade orqali o'chadi.
  await prisma.project.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
