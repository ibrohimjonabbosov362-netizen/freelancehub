import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { syncOverduePayments } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/statuses";

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

export async function POST(request: Request) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { clientId, title, status, description, deadline } = await request.json();

  if (!clientId || !String(title ?? "").trim()) {
    return NextResponse.json(
      { error: "Mijoz va sarlavha kiritilishi shart" },
      { status: 400 }
    );
  }

  if (status !== undefined && !PROJECT_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Noto'g'ri holat" }, { status: 400 });
  }

  const client = await prisma.client.findFirst({ where: { id: clientId, userId } });

  if (!client) {
    return NextResponse.json({ error: "Mijoz topilmadi" }, { status: 404 });
  }

  // Sana noto'g'ri kelsa yozilmaydi — "Invalid Date" bazaga tushmasin
  const parsedDeadline = deadline ? new Date(String(deadline)) : null;
  const validDeadline =
    parsedDeadline && !Number.isNaN(parsedDeadline.getTime()) ? parsedDeadline : null;

  const trimmedDescription =
    typeof description === "string" && description.trim()
      ? description.trim().slice(0, 5000)
      : null;

  const project = await prisma.project.create({
    data: {
      title: String(title).trim().slice(0, 200),
      clientId,
      userId,
      description: trimmedDescription,
      deadline: validDeadline,
      ...(status ? { status: status as ProjectStatus } : {}),
    },
    include: { client: true },
  });

  return NextResponse.json(project, { status: 201 });
}
