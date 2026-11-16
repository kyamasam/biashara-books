import type {
  BandType,
  ChargeType,
  ExtraChargeCode,
  MinimumInstallmentValueCalculationMethod,
  RateCalculationMethod,
} from "@/types/motor";
import type {
  ExtraChargeFormValues,
  PricingRuleFormValues,
  ProductBenefitFormValues,
  ProductFormValues,
} from "./types";

export interface EnumOption<T extends string> {
  value: T;
  label: string;
}

export interface WizardStep {
  key: "basics" | "pricing" | "benefits" | "levies";
  title: string;
  /** Top-level form fields validated (recursively) when leaving this step. */
  fields: Array<keyof ProductFormValues>;
}

export const STEPS: WizardStep[] = [
  {
    key: "basics",
    title: "Basics",
    fields: ["name", "insurer", "vehicle_class", "cover_type", "band_type", "is_active"],
  },
  {
    key: "pricing",
    title: "Pricing",
    fields: [
      "minimum_premium",
      "number_of_allowed_installments",
      "minimum_installment_value",
      "minimum_installment_value_calculation_method",
      "pricing_rules",
    ],
  },
  { key: "benefits", title: "Benefits", fields: ["product_benefits"] },
  { key: "levies", title: "Levies & Review", fields: ["extra_charges"] },
];

export const LAST_STEP = STEPS.length - 1;

export const BAND_TYPE_OPTIONS: Array<EnumOption<BandType> & { description: string }> = [
  { value: "VALUE", label: "Vehicle value", description: "Rate depends on the sum insured (KES)." },
  { value: "TONNAGE", label: "Tonnage", description: "Rate depends on the vehicle's carrying capacity." },
  { value: "SEATS", label: "Seats", description: "Rate depends on passenger seating capacity." },
];

/** Label and adornment for pricing-rule band inputs, per band type. */
export const BAND_UNITS: Record<BandType, { label: string; prefix?: string; suffix?: string; precision: number }> = {
  VALUE: { label: "Value (KES)", prefix: "KES", precision: 0 },
  TONNAGE: { label: "Tonnage (T)", suffix: "T", precision: 2 },
  SEATS: { label: "Seats", suffix: "seats", precision: 0 },
};

export const RATE_METHOD_OPTIONS: Array<EnumOption<RateCalculationMethod>> = [
  { value: "PERCENT_OF_SUM_ASSURED", label: "% of sum assured" },
  { value: "FIXED_AMOUNT", label: "Fixed amount" },
];

export const CHARGE_TYPE_OPTIONS: Array<EnumOption<ChargeType>> = [
  { value: "PERCENT_OF_SUM_INSURED", label: "% of sum insured" },
  { value: "PERCENT_OF_EXTRA_LIMIT", label: "% of extra limit" },
  { value: "FIXED_AMOUNT", label: "Fixed amount" },
];

export const INSTALLMENT_METHOD_OPTIONS: Array<EnumOption<MinimumInstallmentValueCalculationMethod>> = [
  { value: "PERCENTAGE_OF_SUM_INSURED", label: "% of sum insured" },
  { value: "FIXED_AMOUNT", label: "Fixed amount" },
];

export const EXTRA_CHARGE_CODE_OPTIONS: Array<EnumOption<ExtraChargeCode>> = [
  { value: "TRAINING_LEVY", label: "Training levy" },
  { value: "PHCF_LEVY", label: "PHCF levy" },
  { value: "STAMP_DUTY", label: "Stamp duty" },
];

/** Method value shared by every method enum that means "flat KES amount". */
export const FIXED_AMOUNT = "FIXED_AMOUNT";

export const labelOf = <T extends string>(options: Array<EnumOption<T>>, value?: T | null) =>
  options.find((o) => o.value === value)?.label ?? "—";

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const DEFAULT_PRICING_RULE: PricingRuleFormValues = {
  age_min: 0,
  age_max: 99,
  rate_calculation_method: "PERCENT_OF_SUM_ASSURED",
  minimum_premium: 0,
};

export const newBenefitRow = (benefit: string): ProductBenefitFormValues => ({
  benefit,
  enabled: false,
  is_included: false,
  free_limit: null,
  max_limit: null,
  is_tier_based: false,
  charge_type_for_extra: null,
  charge_value: null,
});

export const newExtraChargeRow = (): ExtraChargeFormValues => ({
  method: "PERCENT_OF_SUM_INSURED",
  effective_from: todayIso(),
  effective_to: null,
});

export const DEFAULT_FORM_VALUES: ProductFormValues = {
  band_type: "VALUE",
  is_active: true,
  minimum_premium: 0,
  number_of_allowed_installments: 1,
  minimum_installment_value: 0,
  minimum_installment_value_calculation_method: "PERCENTAGE_OF_SUM_INSURED",
  pricing_rules: [{ ...DEFAULT_PRICING_RULE }],
  product_benefits: [],
  extra_charges: [],
};
