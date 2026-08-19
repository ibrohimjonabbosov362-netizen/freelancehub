// Intl ishlatilmadi: server va brauzer natijasi farq qilsa hidratsiya xatosi chiqadi.

export function formatAmount(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";

  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);

  const [whole, fraction] = Math.abs(amount).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const sign = amount < 0 ? "−" : "";

  return fraction === "00"
    ? `${sign}${grouped} so'm`
    : `${sign}${grouped},${fraction} so'm`;
}

// 59 500 000 -> "59,5 mln so'm"
export function formatAmountShort(
  value: string | number | null | undefined,
  options: { currency?: boolean } = {}
): string {
  const suffix = options.currency === false ? "" : " so'm";
  if (value === null || value === undefined || value === "") return "—";

  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);

  const abs = Math.abs(amount);
  const sign = amount < 0 ? "−" : "";

  const short = (n: number, unit: string) => {
    const rounded = Math.round(n * 10) / 10;
    const text = Number.isInteger(rounded)
      ? String(rounded)
      : String(rounded).replace(".", ",");
    return `${sign}${text} ${unit}${suffix}`;
  };

  if (abs >= 1_000_000_000) return short(abs / 1_000_000_000, "mlrd");
  if (abs >= 1_000_000) return short(abs / 1_000_000, "mln");

  const full = formatAmount(amount);
  return options.currency === false ? full.replace(" so'm", "") : full;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const pad = (n: number) => String(n).padStart(2, "0");

  // UTC — aks holda server va brauzer sanasi farq qiladi
  return `${pad(date.getUTCDate())}.${pad(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}`;
}
