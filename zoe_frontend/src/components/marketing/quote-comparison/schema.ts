import { z } from "zod";
import type { QuoteComparisonPayload } from "@/types/motor";

const DIGITS = /^\d+$/;
const DECIMAL_2 = /^\d{1,6}(\.\d{1,2})?$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const quoteFormSchema = z
  .object({
    // Step 1 — cover
    vehicle_class_id: z.string().min(1, "Pick what you're covering"),
    cover_type_id: z.string().min(1, "Pick a cover type"),

    // Step 2 — vehicle
    vehicle_make_id: z.string(),
    vehicle_model_id: z.string(),
    year_of_manufacture: z.string().regex(DIGITS, "Pick the year it was made"),
    registration_no: z.string().trim().max(20, "Max 20 characters"),
    seats: z
      .string()
      .trim()
      .refine((v) => v === "" || (DIGITS.test(v) && Number(v) >= 1), "Whole number, at least 1"),
    tonnage: z
      .string()
      .trim()
      .refine((v) => v === "" || DECIMAL_2.test(v), "Number, up to 2 decimals"),

    // Step 3 — value & dates
    sum_insured: z
      .string()
      .regex(DIGITS, "Enter the value of your vehicle")
      .refine((v) => Number(v) > 0, "Enter the value of your vehicle")
      .refine((v) => v.length <= 12, "That's a little too much"),
    cover_start: z.string().regex(ISO_DATE, "Pick a start date"),
    cover_end: z.string().regex(ISO_DATE, "Pick an end date"),
    provider_ids: z.array(z.number()),

    // Step 4 — optional extras
    selected_benefits: z.array(
      z.object({
        benefit_id: z.string().min(1),
        /** Whole KES above the insurer's free limit; "" = none. */
        extra_limit: z.string().regex(/^\d{0,12}$/, "Whole KES amount"),
      }),
    ),
  })
  .refine((v) => v.cover_end > v.cover_start, {
    message: "End date must be after the start date",
    path: ["cover_end"],
  });

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;

/** Fields validated before leaving each wizard step. */
export const STEP_FIELDS: Array<Array<keyof QuoteFormValues>> = [
  ["vehicle_class_id", "cover_type_id"],
  ["vehicle_make_id", "vehicle_model_id", "year_of_manufacture", "registration_no", "seats", "tonnage"],
  ["sum_insured", "cover_start", "cover_end", "provider_ids"],
  ["selected_benefits"],
];

/* ---------- dates (local time, no UTC drift) ---------- */

export const toIsoDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const parseIsoDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Start + 1 year − 1 day, e.g. 2026-10-18 → 2027-10-17. */
export const defaultCoverEnd = (startIso: string) => {
  if (!ISO_DATE.test(startIso)) return "";
  const d = parseIsoDate(startIso);
  d.setFullYear(d.getFullYear() + 1);
  d.setDate(d.getDate() - 1);
  return toIsoDate(d);
};

export const getDefaultValues = (): QuoteFormValues => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const start = toIsoDate(tomorrow);
  return {
    vehicle_class_id: "",
    cover_type_id: "",
    vehicle_make_id: "",
    vehicle_model_id: "",
    year_of_manufacture: "",
    registration_no: "",
    seats: "",
    tonnage: "",
    sum_insured: "",
    cover_start: start,
    cover_end: defaultCoverEnd(start),
    provider_ids: [],
    selected_benefits: [],
  };
};

/* ---------- payload ---------- */

export const toComparisonPayload = (v: QuoteFormValues): QuoteComparisonPayload => {
  const registration = v.registration_no.trim().toUpperCase();
  return {
    vehicle_class_id: v.vehicle_class_id,
    cover_type_id: v.cover_type_id,
    // Empty selection = "All insurers" → omit so every matching provider is quoted.
    ...(v.provider_ids.length > 0 && { provider_ids: v.provider_ids }),
    sum_insured: Number(v.sum_insured).toFixed(2),
    cover_start: v.cover_start,
    cover_end: v.cover_end,
    vehicle: {
      year_of_manufacture: Number(v.year_of_manufacture),
      ...(registration && { registration_no: registration }),
      ...(v.vehicle_model_id && { vehicle_model_id: v.vehicle_model_id }),
      ...(v.seats.trim() && { seats: Number(v.seats) }),
      ...(v.tonnage.trim() && { tonnage: Number(v.tonnage).toFixed(2) }),
    },
    ...(v.selected_benefits.length > 0 && {
      selected_benefits: v.selected_benefits.map((b) => ({
        benefit_id: b.benefit_id,
        ...(Number(b.extra_limit) > 0 && { extra_limit: Number(b.extra_limit).toFixed(2) }),
      })),
    }),
  };
};
