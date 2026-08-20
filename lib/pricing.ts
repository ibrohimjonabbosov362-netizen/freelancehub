import { CURRENCY_CODE } from "./format";

/**
 * Premium narxi bitta joyda turadi — landing, tariflar va Tarif sahifasi
 * shu yerdan o'qiydi, shuning uchun ular hech qachon bir-biriga zid bo'lmaydi.
 *
 * Haqiqiy pul Stripe'dagi narx (STRIPE_PRICE_ID) bo'yicha yechiladi; bu yerdagi
 * qiymatlar faqat ko'rsatish uchun, shuning uchun ularni Stripe'dagi narx bilan
 * bir xil qilib qo'ying.
 */
const DEFAULTS: Record<string, { monthly: number; yearly: number }> = {
  UZS: { monthly: 99_000, yearly: 990_000 },
  USD: { monthly: 19, yearly: 190 },
  EUR: { monthly: 19, yearly: 190 },
};

function fromEnv(value: string | undefined): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

const fallback = DEFAULTS[CURRENCY_CODE] ?? DEFAULTS.UZS;

export const premiumPrice = {
  monthly: fromEnv(process.env.NEXT_PUBLIC_PRICE_MONTHLY) ?? fallback.monthly,
  yearly: fromEnv(process.env.NEXT_PUBLIC_PRICE_YEARLY) ?? fallback.yearly,
};

/** Yillik tarifda necha foiz tejaladi (butun songa yaxlitlanadi) */
export const yearlySavingPercent = Math.max(
  0,
  Math.round((1 - premiumPrice.yearly / (premiumPrice.monthly * 12)) * 100)
);
