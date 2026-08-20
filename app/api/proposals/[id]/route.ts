import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PROPOSAL_STATUSES, type ProposalStatus } from "@/lib/statuses";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { id } = await params;

  const proposal = await prisma.proposal.findFirst({
    where: { id, userId },
    include: {
      client: { select: { id: true, name: true, email: true, company: true } },
      // Qabul qilingan taklifdan yaratilgan loyiha
      project: { select: { id: true, title: true, status: true } },
    },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Taklif topilmadi" }, { status: 404 });
  }

  return NextResponse.json({
    id: proposal.id,
    title: proposal.title,
    description: proposal.description,
    amount: proposal.amount.toString(),
    status: proposal.status,
    createdAt: proposal.createdAt.toISOString(),
    updatedAt: proposal.updatedAt.toISOString(),
    client: proposal.client,
    project: proposal.project,
  });
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

  const proposal = await prisma.proposal.findFirst({
    where: { id, userId },
    include: { project: { select: { id: true } } },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Taklif topilmadi" }, { status: 404 });
  }

  // Taklifdan loyiha ochilgan bo'lsa, uni o'chirish loyihani ham yo'q qiladi —
  // buni jimgina qilmaymiz.
  if (proposal.project) {
    return NextResponse.json(
      {
        error:
          "Bu taklifdan loyiha yaratilgan. Avval loyihani o'chiring yoki taklifni qoralamaga qaytaring.",
      },
      { status: 409 }
    );
  }

  await prisma.proposal.delete({ where: { id } });

  return NextResponse.json({ success: true });
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
  const { status } = await request.json();

  if (!PROPOSAL_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Noto'g'ri holat" }, { status: 400 });
  }

  const proposal = await prisma.proposal.findFirst({
    where: { id, userId },
  });

  if (!proposal) {
    return NextResponse.json({ error: "Taklif topilmadi" }, { status: 404 });
  }

  try {
    // Holatni yangilash va loyiha yaratish bitta tranzaksiyada bo'lishi kerak,
    // aks holda loyiha yaratilmay qolsa ham taklif ACCEPTED bo'lib qoladi.
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.proposal.update({
        where: { id },
        data: { status: status as ProposalStatus },
      });

      if (status === "ACCEPTED") {
        const existingProject = await tx.project.findUnique({
          where: { proposalId: id },
        });

        if (!existingProject) {
          await tx.project.create({
            data: {
              title: proposal.title,
              userId,
              clientId: proposal.clientId,
              proposalId: id,
            },
          });
        }
      }

      return result;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Proposal update error:", error);
    return NextResponse.json(
      { error: "Taklifni yangilab bo'lmadi" },
      { status: 500 }
    );
  }
}
