/** Bo'sh satrni null ga aylantiradi — bazada "" saqlanmasin */
export function optionalText(value: unknown, max = 500): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}
