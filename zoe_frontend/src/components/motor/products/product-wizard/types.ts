import type {
  BandType,
  ChargeType,
  ExtraChargeCode,
  MinimumInstallmentValueCalculationMethod,
  RateCalculationMethod,
} from "@/types/motor";

/** Form-side shapes: numbers stay numbers here and become strings in `formValuesToPayload`. */

export interface PricingRuleFormValues {
  /** Existing rule id (edit only); new rows have none. Not sent in the payload. */
  id?: string;
  band_min?: number;
  band_max?: number;
  age_min?: number;
  age_max?: number;
  rate_calculation_method: RateCalculationMethod;
  rate_value?: number;
  minimum_premium?: number;
}

export interface ProductBenefitFormValues {
  /** Benefit id. */
  benefit: string;
  /** UI-only: disabled rows are dropped from the payload. */
  enabled: boolean;
  is_included: boolean;
  free_limit?: number | null;
  max_limit?: number | null;
  is_tier_based: boolean;
  charge_type_for_extra?: ChargeType | null;
  charge_value?: number | null;
}

export interface ExtraChargeFormValues {
  code?: ExtraChargeCode;
  method: ChargeType;
  rate_value?: number;
  /** ISO date (YYYY-MM-DD). */
  effective_from?: string;
  /** ISO date (YYYY-MM-DD), or null for open-ended. */
  effective_to?: string | null;
}

export interface ProductFormValues {
  name?: string;
  insurer?: number;
  vehicle_class?: string;
  cover_type?: string;
  band_type: BandType;
  is_active: boolean;
  minimum_premium?: number;
  number_of_allowed_installments?: number;
  minimum_installment_value?: number;
  minimum_installment_value_calculation_method: MinimumInstallmentValueCalculationMethod;
  pricing_rules: PricingRuleFormValues[];
  product_benefits: ProductBenefitFormValues[];
  extra_charges: ExtraChargeFormValues[];
}

export type WizardMode = "create" | "edit";
