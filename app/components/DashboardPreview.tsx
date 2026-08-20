"use client";

import { useI18n } from "@/lib/i18n/client";

const navIcons: Record<string, string> = {
  dashboard: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z",
  clients: "M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
  proposals: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5",
  projects: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z",
  contracts: "M9 12h6M9 16h4M8 3h8l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z",
  payments: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 1-.1 1.2l2 1.5-2 3.4-2.3-1a8 8 0 0 1-2 1.2L15.2 21H8.8l-.4-2.7a8 8 0 0 1-2-1.2l-2.3 1-2-3.4 2-1.5a8 8 0 0 1 0-2.4l-2-1.5 2-3.4 2.3 1a8 8 0 0 1 2-1.2L8.8 3h6.4l.4 2.7a8 8 0 0 1 2 1.2l2.3-1 2 3.4-2 1.5c.1.4.1.8.1 1.2Z",
  billing: "M3 10h18M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z",
};

function Ico({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
         strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/** Landing uchun mahsulotning haqiqiy UI'sini takrorlaydigan statik ko'rinish. */
export default function DashboardPreview() {
  const { t, locale } = useI18n();
  const en = locale === "en";

  const nav = [
    { key: "dashboard", label: t.nav.dashboard },
    { key: "clients", label: t.nav.clients },
    { key: "proposals", label: t.nav.proposals },
    { key: "projects", label: t.nav.projects },
    { key: "contracts", label: t.nav.contracts },
    { key: "payments", label: t.nav.payments },
    { key: "settings", label: t.nav.settings },
    { key: "billing", label: t.nav.billing },
  ];

  const stats = [
    { label: en ? "Clients" : "Mijozlar", value: "12" },
    { label: en ? "Active projects" : "Faol loyihalar", value: "5" },
    { label: en ? "Pending" : "Kutilayotgan", value: en ? "$2,450" : "31,2 mln" },
  ];

  const projects = [
    { name: en ? "Web App Redesign" : "Veb ilova redizayni", client: "Acme Corp", pct: 65, tone: "var(--viz-1)" },
    { name: en ? "Brand Package" : "Brending paketi", client: "StartupX", pct: 100, tone: "var(--viz-2)" },
    { name: en ? "Store Integration" : "Do'kon integratsiyasi", client: "Shopify", pct: 30, tone: "var(--viz-3)" },
  ];

  const proposals = [
    { name: en ? "UX Audit" : "UX audit", state: en ? "Sent" : "Yuborilgan", cls: "badge-warning" },
    { name: en ? "Mobile App" : "Mobil ilova", state: en ? "Accepted" : "Qabul qilingan", cls: "badge-success" },
  ];

  const payments = [
    { name: "Acme Corp", amount: en ? "$1,200" : "15,2 mln", cls: "badge-warning", state: en ? "Pending" : "Kutilmoqda" },
    { name: "StartupX", amount: en ? "$850" : "10,8 mln", cls: "badge-danger", state: en ? "Overdue" : "Muddati o'tgan" },
  ];

  return (
    <div className="card overflow-hidden" style={{ borderRadius: "var(--radius-lg)" }}>
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-40 shrink-0 border-r border-[var(--border)] p-3 sm:block lg:w-44">
          <div className="px-2 pb-4 pt-1 text-[11px] font-semibold">
            Freelance<span className="gradient-text">Hub</span>
          </div>
          <ul className="space-y-0.5">
            {nav.map((item, i) => (
              <li key={item.key}>
                <span
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] ${
                    i === 0
                      ? "bg-gradient-to-r from-[var(--accent-1)] to-[var(--accent-2)] font-medium text-white"
                      : "text-[var(--faint)]"
                  }`}
                >
                  <Ico d={navIcons[item.key]} />
                  <span className="truncate">{item.label}</span>
                </span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Kontent */}
        <div className="min-w-0 flex-1 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px]" style={{ color: "var(--faint)" }}>
                {en ? "Good morning" : "Xayrli tong"} 👋
              </p>
              <p className="text-sm font-semibold">Sarvar Ahmedov</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden h-6 w-32 rounded-md border border-[var(--border)] bg-[var(--surface-2)] sm:block" />
              <span className="h-6 w-6 rounded-full bg-gradient-to-br from-[var(--accent-1)] to-[var(--accent-2)]" />
            </div>
          </div>

          <div className="mb-3 grid grid-cols-3 gap-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-2.5">
                <p className="text-[10px] leading-tight" style={{ color: "var(--faint)" }}>{stat.label}</p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
              <p className="mb-2.5 text-[11px] font-medium">{en ? "Recent projects" : "So'nggi loyihalar"}</p>
              <ul className="space-y-2.5">
                {projects.map((p) => (
                  <li key={p.name}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[11px]">{p.name}</span>
                      <span className="text-[10px] tabular-nums" style={{ color: "var(--faint)" }}>{p.pct}%</span>
                    </div>
                    <p className="text-[10px]" style={{ color: "var(--faint)" }}>{p.client}</p>
                    <div className="mt-1 h-1 rounded-full" style={{ background: "var(--surface-3)" }}>
                      <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.tone }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                <p className="mb-2 text-[11px] font-medium">{en ? "Recent proposals" : "So'nggi takliflar"}</p>
                <ul className="space-y-1.5">
                  {proposals.map((p) => (
                    <li key={p.name} className="flex items-center justify-between gap-2">
                      <span className="truncate text-[11px]">{p.name}</span>
                      <span className={`badge ${p.cls} !px-1.5 !py-0.5 !text-[9px]`}>{p.state}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                <p className="mb-2 text-[11px] font-medium">{en ? "Upcoming payments" : "Kutilayotgan to'lovlar"}</p>
                <ul className="space-y-1.5">
                  {payments.map((p) => (
                    <li key={p.name} className="flex items-center justify-between gap-2">
                      <span className="truncate text-[11px]">{p.name}</span>
                      <span className="flex items-center gap-1.5">
                        <span className="text-[10px] tabular-nums">{p.amount}</span>
                        <span className={`badge ${p.cls} !px-1.5 !py-0.5 !text-[9px]`}>{p.state}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
