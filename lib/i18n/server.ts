import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALES,
  dictionaries,
  type Dictionary,
  type Locale,
} from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()];
}
