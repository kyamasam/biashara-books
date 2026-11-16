import { format, isValid, parseISO } from "date-fns";
import type { BandType } from "@/types/motor";
import { formatThousands } from "../product-wizard/format";

/** ISO date or datetime → "12 Mar 2026" (or with time when `withTime`). */
export const formatDate = (value?: string | null, withTime = false) => {
  if (!value) return "—";
  const date = parseISO(value);
  if (!isValid(date)) return value;
  return format(date, withTime ? "d MMM yyyy, HH:mm" : "d MMM yyyy");
};

/** A band bound formatted for its band type ("1,000,000", "3.5 T", "14 seats"). */
export const formatBand = (value: string | number | null | undefined, bandType: BandType) => {
  if (value === null || value === undefined || value === "") return "—";
  if (bandType === "VALUE") return `KES ${formatThousands(value)}`;
  if (bandType === "TONNAGE") return `${value} T`;
  return `${value} seats`;
};
