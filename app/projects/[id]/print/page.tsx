import { notFound, redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { getPlanInfo } from "@/lib/subscription";
import { formatAmount, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import PrintButton from "./PrintButton";

export const metadata = { title: "Shartnoma" };

const paymentStatusLabels: Record<string, string> = {
  PENDING: "Kutilmoqda",
  PAID: "To'langan",
  OVERDUE: "Muddati o'tgan",
};

export default async function ContractPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;

  const [planInfo, project, user] = await Promise.all([
    getPlanInfo(userId),
    prisma.project.findFirst({
      where: { id, userId },
      include: {
        client: true,
        contract: true,
        payments: { orderBy: { dueDate: "asc" } },
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
  ]);

  // PDF eksport — Premium funksiyasi.
  if (!planInfo.isPremium) {
    redirect("/billing");
  }

  if (!project?.contract) {
    notFound();
  }

  const total = project.payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <PrintButton backHref={`/projects/${id}`} />

      <article className="print-sheet">
        <header className="doc-header">
          <div>
            <h1 className="doc-title">Shartnoma</h1>
            <p className="doc-sub">{project.title}</p>
          </div>
          <div className="doc-brand">
            Freelance<span>Hub</span>
          </div>
        </header>

        <section className="doc-parties">
          <div>
            <p className="doc-label">Ijrochi</p>
            <p className="doc-value">{user?.name}</p>
            <p className="doc-muted">{user?.email}</p>
          </div>
          <div>
            <p className="doc-label">Buyurtmachi</p>
            <p className="doc-value">{project.client.name}</p>
            <p className="doc-muted">{project.client.email}</p>
            {project.client.company && (
              <p className="doc-muted">{project.client.company}</p>
            )}
          </div>
        </section>

        <section>
          <pre className="doc-body">{project.contract.content}</pre>
        </section>

        {project.payments.length > 0 && (
          <section className="doc-section">
            <h2 className="doc-h2">To&apos;lov jadvali</h2>
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Muddat</th>
                  <th>Summa</th>
                  <th>Holat</th>
                </tr>
              </thead>
              <tbody>
                {project.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.dueDate)}</td>
                    <td>{formatAmount(payment.amount.toString())}</td>
                    <td>{paymentStatusLabels[payment.status]}</td>
                  </tr>
                ))}
                <tr className="doc-total">
                  <td>Jami</td>
                  <td>{formatAmount(total)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </section>
        )}

        <footer className="doc-footer">
          {project.contract.signedAt ? (
            <p>
              Imzolangan: <strong>{formatDate(project.contract.signedAt)}</strong>
            </p>
          ) : (
            <div className="doc-signatures">
              <div>
                <div className="doc-line" />
                <p className="doc-muted">Ijrochi — {user?.name}</p>
              </div>
              <div>
                <div className="doc-line" />
                <p className="doc-muted">Buyurtmachi — {project.client.name}</p>
              </div>
            </div>
          )}
          <p className="doc-generated">
            Hujjat {formatDate(new Date())} sanasida FreelanceHub orqali
            tayyorlandi.
          </p>
        </footer>
      </article>
    </div>
  );
}
