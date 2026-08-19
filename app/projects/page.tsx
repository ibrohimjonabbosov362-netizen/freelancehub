"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "../AppShell";
import Topbar from "../Topbar";
import { formatAmountShort, formatDate } from "@/lib/format";
import {
  BOARD_COLUMNS,
  PROJECT_STATUSES,
  projectStatusBadges,
  projectStatusLabels,
  type ProjectStatus,
} from "@/lib/statuses";

type Project = {
  id: string;
  title: string;
  status: ProjectStatus;
  createdAt: string;
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
      error: res.ok ? "" : data?.error || "Loyihalarni yuklab bo'lmadi",
    };
  } catch {
    return { projects: [], error: "Server bilan bog'lanishda xatolik" };
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [query, setQuery] = useState("");

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
        setActionError(data.error || "Holatni yangilab bo'lmadi");
        return;
      }

      const result = await fetchProjects();
      setProjects(result.projects);
      setLoadError(result.error);
    } catch {
      setActionError("Server bilan bog'lanishda xatolik");
    } finally {
      setUpdatingId(null);
    }
  }

  const term = query.trim().toLowerCase();
  const visible = term
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.client.name.toLowerCase().includes(term)
      )
    : projects;

  const paused = visible.filter((p) => p.status === "PAUSED");

  return (
    <AppShell>
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <Topbar
            query={query}
            onQueryChange={setQuery}
            placeholder="Loyiha yoki mijoz..."
          />

          <div className="mb-5">
            <h1 className="page-title">Loyihalar doskasi</h1>
            <p className="hint mt-1">
              {loading ? "Yuklanmoqda..." : `${visible.length} ta loyiha`}
            </p>
          </div>

          {actionError && (
            <div className="alert alert-danger mb-4">{actionError}</div>
          )}

          {loading ? (
            <p className="hint">Yuklanmoqda...</p>
          ) : loadError ? (
            <p className="text-sm text-[var(--danger)]">{loadError}</p>
          ) : projects.length === 0 ? (
            <div className="card empty">
              <p className="mb-1 font-medium">Hali loyiha yo&apos;q</p>
              <p className="hint">
                Loyihalar taklif qabul qilinganda avtomatik yaratiladi.
              </p>
              <Link href="/proposals" className="btn btn-ghost btn-sm mt-4">
                Takliflarga o&apos;tish
              </Link>
            </div>
          ) : (
            <>
              <div className="kanban">
                {BOARD_COLUMNS.map((column) => {
                  const items = visible.filter((p) => p.status === column);

                  return (
                    <div key={column} className="kanban-col">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {projectStatusLabels[column]}
                        </span>
                        <span className="rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-xs text-[var(--muted)]">
                          {items.length}
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {items.map((project) => {
                          const progress =
                            project.dueTotal > 0
                              ? Math.round(
                                  (project.paidTotal / project.dueTotal) * 100
                                )
                              : 0;

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
                                  {project.nextDueDate
                                    ? formatDate(project.nextDueDate)
                                    : formatDate(project.createdAt)}
                                </span>

                                <select
                                  value={project.status}
                                  onChange={(e) =>
                                    handleStatusChange(project.id, e.target.value)
                                  }
                                  disabled={updatingId === project.id}
                                  aria-label={`${project.title} holati`}
                                  className="input w-auto px-2 py-1 text-xs"
                                >
                                  {PROJECT_STATUSES.map((value) => (
                                    <option key={value} value={value}>
                                      {projectStatusLabels[value]}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </article>
                          );
                        })}

                        {items.length === 0 && (
                          <p className="py-6 text-center text-xs text-[var(--faint)]">
                            Bo&apos;sh
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {paused.length > 0 && (
                <section className="card mt-5 p-5">
                  <h2 className="section-title mb-3">To&apos;xtatilgan</h2>
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
                            {projectStatusLabels.PAUSED}
                          </span>
                          <select
                            value={project.status}
                            onChange={(e) =>
                              handleStatusChange(project.id, e.target.value)
                            }
                            disabled={updatingId === project.id}
                            aria-label={`${project.title} holati`}
                            className="input w-auto px-2 py-1 text-xs"
                          >
                            {PROJECT_STATUSES.map((value) => (
                              <option key={value} value={value}>
                                {projectStatusLabels[value]}
                              </option>
                            ))}
                          </select>
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
