// Intl ishlatilmadi: server va brauzer natijasi farq qilsa hidratsiya xatosi chiqadi.

type CurrencyStyle = {
  /** Belgining o'zi: "so'm", "$", "€" */
  symbol: string;
  /** Summadan oldin turadimi yoki keyin */
  position: "before" | "after";
  /** Katta sonlarni qisqartirish qo'shimchalari */
  short: { million: string; billion: string };
};

const CURRENCIES: Record<string, CurrencyStyle> = {
  UZS: {
    symbol: "so'm",
    position: "after",
    short: { million: "mln", billion: "mlrd" },
  },
  USD: {
    symbol: "$",
    position: "before",
    short: { million: "M", billion: "B" },
  },
  EUR: {
    symbol: "€",
    position: "before",
    short: { million: "M", billion: "B" },
  },
};

export const CURRENCY_CODE = (
  process.env.NEXT_PUBLIC_CURRENCY ?? "UZS"
).toUpperCase();

/** Sozlanmagan valyuta kodi berilsa so'mga qaytamiz — sahifa buzilmasin */
const style = CURRENCIES[CURRENCY_CODE] ?? CURRENCIES.UZS;

/** Faqat belgi kerak bo'lgan joylar uchun (masalan narx jadvali) */
export const currencySymbol = style.symbol;

function withSymbol(value: string): string {
  return style.position === "before"
    ? `${style.symbol}${value}`
    : `${value} ${style.symbol}`;
}

export function formatAmount(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";

  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);

  const [whole, fraction] = Math.abs(amount).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const sign = amount < 0 ? "−" : "";

  const body = fraction === "00" ? grouped : `${grouped},${fraction}`;

  return `${sign}${withSymbol(body)}`;
}

// 59 500 000 -> "59,5 mln so'm"  (USD'da: "$59.5M")
export function formatAmountShort(
  value: string | number | null | undefined,
  options: { currency?: boolean } = {}
): string {
  if (value === null || value === undefined || value === "") return "—";

  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);

  const abs = Math.abs(amount);
  const sign = amount < 0 ? "−" : "";
  const showCurrency = options.currency !== false;

  const short = (n: number, unit: string) => {
    const rounded = Math.round(n * 10) / 10;
    const text = Number.isInteger(rounded)
      ? String(rounded)
      : String(rounded).replace(".", ",");

    const body = `${text} ${unit}`;
    return sign + (showCurrency ? withSymbol(body) : body);
  };

  if (abs >= 1_000_000_000) return short(abs / 1_000_000_000, style.short.billion);
  if (abs >= 1_000_000) return short(abs / 1_000_000, style.short.million);

  const full = formatAmount(amount);
  if (showCurrency) return full;

  // Belgisiz variant: "1 200 so'm" -> "1 200", "$1 200" -> "1 200"
  return full.replace(` ${style.symbol}`, "").replace(style.symbol, "");
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const pad = (n: number) => String(n).padStart(2, "0");

  // UTC — aks holda server va brauzer sanasi farq qiladi
  return `${pad(date.getUTCDate())}.${pad(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}`;
}
