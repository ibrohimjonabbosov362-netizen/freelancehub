"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "../AppShell";
import Topbar from "../Topbar";
import Icon from "../Icon";
import { EmptyState, PageHeader, Skeleton, TableSkeleton, useToast } from "../components/ui";
import { useI18n } from "@/lib/i18n/client";
import { fill } from "@/lib/i18n/dictionaries";
import { formatAmount, formatAmountShort, formatDate } from "@/lib/format";
import {
  BOARD_COLUMNS,
  PROJECT_STATUSES,
  projectStatusBadges,
  type ProjectStatus,
} from "@/lib/statuses";

type Project = {
  id: string;
  title: string;
  status: ProjectStatus;
  createdAt: string;
  deadline: string | null;
  client: { name: string };
  paidTotal: number;
  dueTotal: number;
  nextDueDate: string | null;
};

async function fetchProjects(): Promise<{ projects: Project[]; error: string }> {
  try {
    const res = await fetch("/api/projects");
    const data = await res.json();

    return {
      projects: Array.isArray(data) ? data : [],
      error: res.ok ? "" : data?.error || "load",
    };
  } catch {
    return { projects: [], error: "network" };
  }
}

function progressOf(project: Project) {
  return project.dueTotal > 0
    ? Math.min(100, Math.round((project.paidTotal / project.dueTotal) * 100))
    : 0;
}

export default function ProjectsPage() {
  const { t } = useI18n();
  const toast = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"board" | "list">("board");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await fetchProjects();
      if (cancelled) return;

      setProjects(result.projects);
      setLoadError(result.error);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleStatusChange(id: string, status: string) {
    setUpdatingId(id);
    setActionError("");

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || t.common.genericError);
        return;
      }

      toast(t.projects.statusUpdated);

      const result = await fetchProjects();
      setProjects(result.projects);
      setLoadError(result.error);
    } catch {
      setActionError(t.common.serverError);
    } finally {
      setUpdatingId(null);
    }
  }

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return projects;

    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(term) ||
        project.client.name.toLowerCase().includes(term)
    );
  }, [projects, query]);

  const paused = visible.filter((project) => project.status === "PAUSED");

  const statusSelect = (project: Project, small = false) => (
    <select
      value={project.status}
      onChange={(e) => handleStatusChange(project.id, e.target.value)}
      disabled={updatingId === project.id}
      aria-label={`${project.title} — ${t.common.status}`}
      className={`input w-auto ${small ? "px-2 py-1 text-xs" : "py-1.5 text-sm"}`}
    >
      {PROJECT_STATUSES.map((value) => (
        <option key={value} value={value}>
          {t.status[value]}
        </option>
      ))}
    </select>
  );

  return (
    <AppShell>
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <Topbar
            query={query}
            onQueryChange={setQuery}
            placeholder={t.projects.searchPlaceholder}
          />

          <PageHeader
            title={view === "board" ? t.projects.boardTitle : t.nav.projects}
            subtitle={
              loading
                ? t.common.loading
                : fill(t.projects.count, { n: visible.length })
            }
          >
            {/* Ko'rinishni almashtirish */}
            <div className="flex rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-1">
              {(["board", "list"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setView(value)}
                  aria-pressed={view === value}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    view === value
                      ? "bg-[var(--surface-3)] font-medium text-[var(--ink)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {value === "board" ? t.projects.viewBoard : t.projects.viewList}
                </button>
              ))}
            </div>
          </PageHeader>

          {actionError && <div className="alert alert-danger mb-4">{actionError}</div>}

          {loading ? (
            view === "board" ? (
              <div className="kanban">
                {BOARD_COLUMNS.map((column) => (
                  <div key={column} className="kanban-col space-y-2.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="card overflow-hidden">
                <TableSkeleton rows={5} cols={5} />
              </div>
            )
          ) : loadError ? (
            <div className="card">
              <EmptyState
                icon={<Icon name="alert" />}
                title={t.common.loadFailed}
                text={loadError === "network" ? t.common.serverError : loadError}
              />
            </div>
          ) : projects.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<Icon name="folder" />}
                title={t.projects.emptyTitle}
                text={t.projects.emptyText}
                action={
                  <Link href="/proposals" className="btn btn-ghost btn-sm">
                    {t.projects.goToProposals}
                  </Link>
                }
              />
            </div>
          ) : visible.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<Icon name="search" />}
                title={t.common.noResults}
                text={t.common.noResultsHint}
              />
            </div>
          ) : view === "list" ? (
            <div className="card overflow-hidden">
              {/* Desktop: jadval */}
              <div className="table-wrap hidden md:block">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t.projects.colProject}</th>
                      <th>{t.projects.colClient}</th>
                      <th>{t.projects.colStatus}</th>
                      <th>{t.projects.colDeadline}</th>
                      <th className="text-right">{t.projects.colValue}</th>
                      <th className="w-40">{t.projects.colProgress}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((project) => {
                      const progress = progressOf(project);

                      return (
                        <tr key={project.id}>
                          <td>
                            <Link
                              href={`/projects/${project.id}`}
                              className="link font-medium"
                            >
                              {project.title}
                            </Link>
                          </td>
                          <td className="text-[var(--muted)]">
                            {project.client.name}
                          </td>
                          <td>{statusSelect(project, true)}</td>
                          <td className="whitespace-nowrap text-[var(--muted)]">
                            {project.deadline ? formatDate(project.deadline) : "—"}
                          </td>
                          <td className="whitespace-nowrap text-right tabular-nums">
                            {project.dueTotal > 0
                              ? formatAmount(project.dueTotal)
                              : "—"}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="meter flex-1">
                                <span style={{ width: `${progress}%` }} />
                              </div>
                              <span className="w-9 text-right text-xs tabular-nums text-[var(--muted)]">
                                {progress}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobil: kartalar */}
              <ul className="divide-y divide-[var(--border)] md:hidden">
                {visible.map((project) => {
                  const progress = progressOf(project);

                  return (
                    <li key={project.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/projects/${project.id}`}
                            className="link block truncate text-sm font-medium"
                          >
                            {project.title}
                          </Link>
                          <p className="truncate text-xs text-[var(--faint)]">
                            {project.client.name}
                            {project.deadline && ` · ${formatDate(project.deadline)}`}
                          </p>
                        </div>
                        <span className={`badge ${projectStatusBadges[project.status]}`}>
                          {t.status[project.status]}
                        </span>
                      </div>

                      {project.dueTotal > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="meter flex-1">
                            <span style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs tabular-nums text-[var(--muted)]">
                            {formatAmountShort(project.paidTotal)} / {progress}%
                          </span>
                        </div>
                      )}

                      <div className="mt-3">{statusSelect(project, true)}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <>
              <div className="kanban">
                {BOARD_COLUMNS.map((column) => {
                  const items = visible.filter((p) => p.status === column);

                  return (
                    <div key={column} className="kanban-col">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium">{t.status[column]}</span>
                        <span className="rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-xs text-[var(--muted)]">
                          {items.length}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {items.map((project) => {
                          const progress = progressOf(project);

                          return (
                            <article key={project.id} className="kanban-card">
                              <Link
                                href={`/projects/${project.id}`}
                                className="link block text-sm font-medium"
                              >
                                {project.title}
                              </Link>
                              <p className="mt-0.5 text-xs text-[var(--faint)]">
                                {project.client.name}
                              </p>

                              {project.dueTotal > 0 && (
                                <div className="mt-3">
                                  <div className="mb-1 flex items-center justify-between text-xs text-[var(--muted)]">
                                    <span>{formatAmountShort(project.paidTotal)}</span>
                                    <span>{progress}%</span>
                                  </div>
                                  <div className="meter">
                                    <span style={{ width: `${progress}%` }} />
                                  </div>
                                </div>
                              )}

                              <div className="mt-3 flex items-center justify-between gap-2">
                                <span className="text-xs text-[var(--faint)]">
                                  {project.deadline
                                    ? formatDate(project.deadline)
                                    : project.nextDueDate
                                      ? formatDate(project.nextDueDate)
                                      : formatDate(project.createdAt)}
                                </span>

                                {statusSelect(project, true)}
                              </div>
                            </article>
                          );
                        })}

                        {items.length === 0 && (
                          <p className="py-6 text-center text-xs text-[var(--faint)]">
                            {t.projects.columnEmpty}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {paused.length > 0 && (
                <section className="card mt-5 p-5">
                  <h2 className="section-title mb-3">{t.status.PAUSED}</h2>
                  <ul className="space-y-2.5">
                    {paused.map((project) => (
                      <li
                        key={project.id}
                        className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-2.5 first:border-0 first:pt-0"
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/projects/${project.id}`}
                            className="link block truncate text-sm"
                          >
                            {project.title}
                          </Link>
                          <span className="text-xs text-[var(--faint)]">
                            {project.client.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`badge ${projectStatusBadges.PAUSED}`}>
                            {t.status.PAUSED}
                          </span>
                          {statusSelect(project, true)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
