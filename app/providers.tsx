"use client";

import { SessionProvider } from "next-auth/react";
import { LocaleProvider } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/dictionaries";
import { ToastProvider } from "./components/ui";

export function Providers({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <LocaleProvider locale={locale}>
        <ToastProvider>{children}</ToastProvider>
      </LocaleProvider>
    </SessionProvider>
  );
}
