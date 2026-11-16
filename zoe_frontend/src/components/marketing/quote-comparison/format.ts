const kes = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" });
const kesWhole = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

/** Decimal strings from the API → number (null/blank/garbage → 0). */
export const toAmount = (value: string | number | null | undefined) => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

export const formatKES = (value: string | number | null | undefined) =>
  kes.format(toAmount(value));

export const formatKESWhole = (value: string | number | null | undefined) =>
  kesWhole.format(toAmount(value));

/** "1500000" → "1,500,000" for the sum-insured input. */
export const formatThousands = (digits: string) =>
  digits ? Number(digits).toLocaleString("en-KE") : "";

/** "PRIVATE" → "Private", "PSV" stays "PSV", "THIRD_PARTY" → "Third Party". */
export const prettyLabel = (value: string) => {
  const cleaned = value.replace(/[_-]+/g, " ").trim();
  if (cleaned.length <= 4 && cleaned === cleaned.toUpperCase()) return cleaned;
  return cleaned
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
};
