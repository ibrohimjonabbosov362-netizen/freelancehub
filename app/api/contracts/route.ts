import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const contracts = await prisma.contract.findMany({
    where: { project: { userId } },
    include: {
      project: {
        select: { id: true, title: true, client: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    contracts.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      signedAt: c.signedAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
      excerpt: c.content.slice(0, 120),
      projectId: c.project.id,
      projectTitle: c.project.title,
      clientId: c.project.client.id,
      clientName: c.project.client.name,
    }))
  );
}
