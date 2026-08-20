"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "../AppShell";
import { Avatar, PageHeader, Skeleton, useToast } from "../components/ui";
import { useI18n } from "@/lib/i18n/client";
import { formatDate } from "@/lib/format";

type Profile = {
  name: string | null;
  email: string;
  createdAt: string;
  clients: number;
  proposals: number;
  projects: number;
};

async function fetchProfile(): Promise<Profile | null> {
  try {
    const res = await fetch("/api/user");
    if (!res.ok) return null;
    return (await res.json()) as Profile;
  } catch {
    return null;
  }
}

export default function SettingsPage() {
  const { t } = useI18n();
  const toast = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [nameBusy, setNameBusy] = useState(false);
  const [nameMsg, setNameMsg] = useState("");
  const [nameErr, setNameErr] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await fetchProfile();
      if (cancelled) return;

      setProfile(result);
      setName(result?.name ?? "");
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setNameBusy(true);
    setNameMsg("");
    setNameErr("");

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setNameErr(data.error || t.common.genericError);
        return;
      }

      setNameMsg(t.common.saved);
      toast(t.common.saved);
      const fresh = await fetchProfile();
      if (fresh) setProfile(fresh);
    } catch {
      setNameErr(t.common.serverError);
    } finally {
      setNameBusy(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg("");
    setPwErr("");

    if (newPassword !== repeatPassword) {
      setPwErr(t.settings.passwordsDiffer);
      return;
    }

    setPwBusy(true);

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPwErr(data.error || t.common.genericError);
        return;
      }

      setPwMsg(t.settings.passwordChanged);
      toast(t.settings.passwordChanged);
      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");
    } catch {
      setPwErr(t.common.serverError);
    } finally {
      setPwBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-2xl">
          <PageHeader title={t.nav.settings} />

          {loading ? (
            <div className="space-y-5">
              <Skeleton className="h-56 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          ) : !profile ? (
            <p className="text-sm text-[var(--danger)]">{t.common.loadFailed}</p>
          ) : (
            <div className="space-y-5">
              <section className="card p-6">
                <div className="mb-5 flex items-center gap-4">
                  <Avatar name={profile.name} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{profile.name}</p>
                    <p className="truncate text-sm text-[var(--muted)]">
                      {profile.email}
                    </p>
                  </div>
                </div>

                <h2 className="section-title mb-4">{t.settings.profile}</h2>

                <form onSubmit={saveName} className="space-y-4">
                  {nameErr && <div className="alert alert-danger">{nameErr}</div>}
                  {nameMsg && <div className="alert alert-success">{nameMsg}</div>}

                  <div>
                    <label htmlFor="s-name" className="label">{t.common.name}</label>
                    <input
                      id="s-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="input"
                    />
                  </div>

                  <div>
                    <label htmlFor="s-email" className="label">{t.common.email}</label>
                    <input id="s-email" type="email" value={profile.email} disabled className="input" />
                    <p className="mt-1.5 text-xs text-[var(--faint)]">
                      {t.settings.emailLocked}
                    </p>
                  </div>

                  <button type="submit" disabled={nameBusy} className="btn btn-accent btn-sm">
                    {nameBusy ? t.common.saving : t.common.save}
                  </button>
                </form>
              </section>

              <section className="card p-6">
                <h2 className="section-title mb-4">{t.settings.changePassword}</h2>

                <form onSubmit={savePassword} className="space-y-4">
                  {pwErr && <div className="alert alert-danger">{pwErr}</div>}
                  {pwMsg && <div className="alert alert-success">{pwMsg}</div>}

                  <div>
                    <label htmlFor="s-cur" className="label">{t.settings.currentPassword}</label>
                    <input
                      id="s-cur"
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="input"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="s-new" className="label">{t.settings.newPassword}</label>
                      <input
                        id="s-new"
                        type="password"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className="input"
                      />
                    </div>
                    <div>
                      <label htmlFor="s-rep" className="label">{t.settings.repeatPassword}</label>
                      <input
                        id="s-rep"
                        type="password"
                        autoComplete="new-password"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        required
                        minLength={6}
                        className="input"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={pwBusy} className="btn btn-accent btn-sm">
                    {pwBusy ? t.settings.changing : t.settings.changePassword}
                  </button>
                </form>
              </section>

              <section className="card p-6">
                <h2 className="section-title mb-4">{t.settings.account}</h2>
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <dt className="hint">{t.settings.registered}</dt>
                    <dd className="mt-1 font-medium">{formatDate(profile.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="hint">{t.nav.clients}</dt>
                    <dd className="mt-1 font-medium">{profile.clients}</dd>
                  </div>
                  <div>
                    <dt className="hint">{t.nav.proposals}</dt>
                    <dd className="mt-1 font-medium">{profile.proposals}</dd>
                  </div>
                  <div>
                    <dt className="hint">{t.nav.projects}</dt>
                    <dd className="mt-1 font-medium">{profile.projects}</dd>
                  </div>
                </dl>

                <Link href="/billing" className="btn btn-ghost btn-sm mt-5">
                  {t.settings.managePlan}
                </Link>
              </section>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
