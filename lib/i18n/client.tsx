"use client";

import { createContext, useContext } from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  dictionaries,
  type Dictionary,
  type Locale,
} from "./dictionaries";

const LocaleContext = createContext<{ locale: Locale; t: Dictionary }>({
  locale: DEFAULT_LOCALE,
  t: dictionaries[DEFAULT_LOCALE],
});

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, t: dictionaries[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useI18n() {
  return useContext(LocaleContext);
}

export function setLocale(locale: Locale) {
  // Bir yil eslab qoladi; sahifa qayta yuklanganda server ham shu qiymatni o'qiydi
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
  window.location.reload();
}
