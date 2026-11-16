import { FIXED_AMOUNT } from "./constants";

type Numeric = number | string | null | undefined;

/** "1234567.5" → "1,234,567.5" (decimals left untouched). */
export const formatThousands = (value: Numeric) => {
  const [int, dec] = `${value ?? ""}`.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec === undefined ? grouped : `${grouped}.${dec}`;
};

export const parseThousands = (display?: string) => display?.replace(/,/g, "") ?? "";

export const formatMoney = (value: Numeric) =>
  value === null || value === undefined || value === "" ? "—" : `KES ${formatThousands(value)}`;

/** Percentage or KES amount, depending on the method. */
export const formatRate = (value: Numeric, method?: string | null) => {
  if (value === null || value === undefined || value === "") return "—";
  return method === FIXED_AMOUNT ? formatMoney(value) : `${value}%`;
};
