import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const MAX_CONTENT_LENGTH = 50_000;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: { contract: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Loyiha topilmadi" }, { status: 404 });
  }

  return NextResponse.json(project.contract);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { id } = await params;
  const { content } = await request.json();

  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json(
      { error: "Shartnoma matni bo'sh bo'lishi mumkin emas" },
      { status: 400 }
    );
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: "Shartnoma matni juda uzun" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: { contract: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Loyiha topilmadi" }, { status: 404 });
  }

  if (project.contract?.signedAt) {
    return NextResponse.json(
      { error: "Imzolangan shartnomani o'zgartirib bo'lmaydi" },
      { status: 409 }
    );
  }

  const contract = await prisma.contract.upsert({
    where: { projectId: id },
    create: { projectId: id, content: content.trim() },
    update: { content: content.trim() },
  });

  return NextResponse.json(contract);
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
  const { signed } = await request.json();

  if (typeof signed !== "boolean") {
    return NextResponse.json(
      { error: "`signed` maydoni true yoki false bo'lishi kerak" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: { contract: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Loyiha topilmadi" }, { status: 404 });
  }

  if (!project.contract) {
    return NextResponse.json(
      { error: "Avval shartnoma matnini saqlang" },
      { status: 404 }
    );
  }

  const contract = await prisma.contract.update({
    where: { projectId: id },
    data: { signedAt: signed ? new Date() : null },
  });

  return NextResponse.json(contract);
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

  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: { contract: true },
  });

  if (!project?.contract) {
    return NextResponse.json({ error: "Shartnoma topilmadi" }, { status: 404 });
  }

  await prisma.contract.delete({ where: { projectId: id } });

  return NextResponse.json({ success: true });
}
