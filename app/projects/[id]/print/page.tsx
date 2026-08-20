import { notFound, redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { getPlanInfo } from "@/lib/subscription";
import { formatAmount, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import PrintButton from "./PrintButton";
import { getDictionary } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/dictionaries";

export async function generateMetadata() {
  const t = await getDictionary();
  return { title: t.document.title };
}

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

  const [t, planInfo, project, user] = await Promise.all([
    getDictionary(),
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
      <Suspense fallback={null}>
        <PrintButton backHref={`/projects/${id}`} />
      </Suspense>

      <article className="print-sheet">
        <header className="doc-header">
          <div>
            <h1 className="doc-title">{t.document.title}</h1>
            <p className="doc-sub">{project.title}</p>
          </div>
          <div className="doc-brand">
            Freelance<span>Hub</span>
          </div>
        </header>

        <section className="doc-parties">
          <div>
            <p className="doc-label">{t.document.contractor}</p>
            <p className="doc-value">{user?.name}</p>
            <p className="doc-muted">{user?.email}</p>
          </div>
          <div>
            <p className="doc-label">{t.document.clientParty}</p>
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
            <h2 className="doc-h2">{t.document.paymentSchedule}</h2>
            <table className="doc-table">
              <thead>
                <tr>
                  <th>{t.document.due}</th>
                  <th>{t.document.amount}</th>
                  <th>{t.document.status}</th>
                </tr>
              </thead>
              <tbody>
                {project.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.dueDate)}</td>
                    <td>{formatAmount(payment.amount.toString())}</td>
                    <td>{t.status[payment.status as keyof typeof t.status]}</td>
                  </tr>
                ))}
                <tr className="doc-total">
                  <td>{t.document.total}</td>
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
              {t.document.signedOn}:{" "}
              <strong>{formatDate(project.contract.signedAt)}</strong>
            </p>
          ) : (
            <div className="doc-signatures">
              <div>
                <div className="doc-line" />
                <p className="doc-muted">{t.document.contractor} — {user?.name}</p>
              </div>
              <div>
                <div className="doc-line" />
                <p className="doc-muted">{t.document.clientParty} — {project.client.name}</p>
              </div>
            </div>
          )}
          <p className="doc-generated">
            {fill(t.document.generated, { date: formatDate(new Date()) })}
          </p>
        </footer>
      </article>
    </div>
  );
}
