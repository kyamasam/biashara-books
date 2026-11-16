import type { InsuranceProvider } from "@/types/insurance";

export type { InsuranceProvider } from "@/types/insurance";

export interface VehicleClass {
  id: string;
  code: string;
  name: string;
}

export interface VehicleMake {
  id: string;
  name: string;
}

export interface VehicleModel {
  id: string;
  name: string;
  vehicle_make: VehicleMake;
}

export interface VehicleValuation {
  id: string;
  value: string;
  valued_on: string;
  valuer: string;
  report_url: string | null;
}

export interface Vehicle {
  id: string;
  registration_no: string;
  chassis_no: string | null;
  engine_no: string | null;
  vehicle_model: VehicleModel | null;
  vehicle_class: VehicleClass | null;
  log_book: string | null;
  year_of_manufacture: number;
  engine_cc: number | null;
  seats: number | null;
  tonnage: string | null;
  has_tracker: boolean;
  colour: string | null;
  customer: string | null;
  latest_valuation: VehicleValuation | null;
  created_at: string;
  updated_at: string;
}

export interface VehiclePayload {
  registration_no: string;
  chassis_no?: string | null;
  engine_no?: string | null;
  vehicle_model_id?: string | null;
  vehicle_class_id?: string | null;
  year_of_manufacture: number;
  engine_cc?: number | null;
  seats?: number | null;
  tonnage?: string | null;
  has_tracker?: boolean;
  colour?: string | null;
}

export type NationalIdentifierType = "ID" | "PASSPORT";
export type CustomerType = "INDIVIDUAL" | "BUSINESS";

export interface InlineCustomer {
  full_name: string;
  national_identifier: string;
  national_identifier_type: NationalIdentifierType;
  customer_type: CustomerType;
  phone?: string;
  email?: string;
  kra_pin?: string;
}

export type BenefitCode =
  | "WINDSCREEN"
  | "ENTERTAINMENT"
  | "EXCESS_PROTECTOR_OD"
  | "PVT"
  | "COURTESY_CAR"
  | "AA_ROAD_RESCUE"
  | "PLL"
  | "PA_DRIVER";

export interface Benefit {
  id: string;
  code: BenefitCode;
  name: string;
  is_active?: boolean;
}

export interface CoverType {
  id: string;
  code: string;
  name: string;
}

/** Query params for paginated, searchable motor catalogue lists. */
export interface MotorCatalogueListParams {
  page?: number;
  search?: string;
}

/** Query params for `GET /motor/benefits/`. `is_active` is honoured for admins only. */
export interface BenefitListParams extends MotorCatalogueListParams {
  is_active?: boolean;
}

/** Body for `POST /motor/benefits/` (admin only). */
export interface CreateBenefitPayload {
  code: BenefitCode;
  name: string;
  is_active?: boolean;
}

/** Body for `PATCH /motor/benefits/{id}/` (admin only). */
export type UpdateBenefitPayload = Partial<CreateBenefitPayload>;

export type BandType = "VALUE" | "TONNAGE" | "SEATS";

export type ChargeType =
  | "PERCENT_OF_SUM_INSURED"
  | "FIXED_AMOUNT"
  | "PERCENT_OF_EXTRA_LIMIT";

export type MinimumInstallmentValueCalculationMethod =
  | "PERCENTAGE_OF_SUM_INSURED"
  | "FIXED_AMOUNT";

export type ExtraChargeCode = "TRAINING_LEVY" | "PHCF_LEVY" | "STAMP_DUTY";

export type RateCalculationMethod = "PERCENT_OF_SUM_ASSURED" | "FIXED_AMOUNT";

export interface ProductBenefit {
  id: string;
  benefit: Benefit;
  is_included: boolean;
  free_limit: string | null;
  max_limit: string | null;
  is_tier_based: boolean;
  charge_type_for_extra: ChargeType | "" | null;
  charge_value: string | null;
}

export interface ExtraCharge {
  id: string;
  code: ExtraChargeCode;
  method: ChargeType;
  rate_value: string;
  /** ISO date (YYYY-MM-DD). */
  effective_from: string;
  effective_to: string | null;
}

export interface PricingRule {
  id: string;
  band_min: string;
  band_max: string;
  age_min: number;
  age_max: number;
  rate_calculation_method: RateCalculationMethod;
  rate_value: string;
  minimum_premium: string;
}

export interface MotorInsuranceProduct {
  id: string;
  name: string;
  insurer: InsuranceProvider;
  vehicle_class: VehicleClass;
  cover_type: CoverType;
  band_type: BandType;
  minimum_premium: string;
  number_of_allowed_installments: number;
  minimum_installment_value: string;
  minimum_installment_value_calculation_method: MinimumInstallmentValueCalculationMethod;
  product_benefits: ProductBenefit[];
  extra_charges: ExtraCharge[];
  pricing_rules: PricingRule[];
  is_active?: boolean;
  /** ISO datetime. */
  created_at?: string;
  /** ISO datetime. */
  updated_at?: string;
}

/**
 * A pricing rule row sent on create/update.
 * `rate_value` is a percentage (4 = 4%) unless `rate_calculation_method` is `FIXED_AMOUNT`.
 * Decimals are sent as strings.
 */
export interface PricingRulePayload {
  band_min?: string;
  band_max?: string;
  age_min?: number;
  age_max?: number;
  rate_calculation_method: RateCalculationMethod;
  rate_value: string;
  minimum_premium?: string;
}

/**
 * A product benefit row sent on create/update.
 * `charge_value` is a percentage (10 = 10%) unless `charge_type_for_extra` is `FIXED_AMOUNT`.
 * Decimals are sent as strings.
 */
export interface ProductBenefitPayload {
  /** Benefit id. */
  benefit: Benefit["id"];
  is_included?: boolean;
  free_limit?: string | null;
  max_limit?: string | null;
  is_tier_based?: boolean;
  charge_type_for_extra?: ChargeType;
  charge_value?: string | null;
}

/**
 * An extra charge row sent on create/update.
 * `rate_value` is a percentage (0.2 = 0.2%) unless `method` is `FIXED_AMOUNT`.
 * Decimals are sent as strings.
 */
export interface ExtraChargePayload {
  code: ExtraChargeCode;
  method: ChargeType;
  rate_value: string;
  /** ISO date (YYYY-MM-DD). */
  effective_from: string;
  /** ISO date (YYYY-MM-DD), or null for open-ended. */
  effective_to?: string | null;
}

/**
 * Body for `POST /motor/products/` (admin only).
 * Each nested list that is sent fully replaces the product's existing rows.
 * Decimals are sent as strings.
 */
export interface MotorProductPayload {
  name: string;
  /** InsuranceProvider id. */
  insurer: number;
  /** VehicleClass uuid. */
  vehicle_class: string;
  /** CoverType uuid. */
  cover_type: string;
  band_type: BandType;
  minimum_premium: string;
  number_of_allowed_installments?: number;
  minimum_installment_value: string;
  minimum_installment_value_calculation_method: MinimumInstallmentValueCalculationMethod;
  is_active?: boolean;
  /** At least one rule is required. Replaces all existing rules. */
  pricing_rules: PricingRulePayload[];
  /** Replaces all existing product benefits when sent. */
  product_benefits?: ProductBenefitPayload[];
  /** Replaces all existing extra charges when sent. */
  extra_charges?: ExtraChargePayload[];
}

/**
 * Body for `PATCH /motor/products/{id}/` (admin only).
 * Omitting a nested list leaves it unchanged; sending one fully replaces it.
 */
export type UpdateMotorProductPayload = Partial<MotorProductPayload>;

/** Standalone pricing rule from `/motor/pricing-rules/`. */
export interface MotorPricingRule extends PricingRule {
  /** MotorInsuranceProduct uuid. */
  motor_insurance_product: string;
  is_active: boolean;
}

/**
 * Body for `POST /motor/pricing-rules/` (admin only).
 * Defaults: band_min 0, band_max 999999999, age_min 0, age_max 99, minimum_premium 0.
 */
export interface CreatePricingRulePayload extends PricingRulePayload {
  /** MotorInsuranceProduct uuid. */
  motor_insurance_product: string;
  is_active?: boolean;
}

/** Body for `PATCH /motor/pricing-rules/{id}/` (admin only). */
export type UpdatePricingRulePayload = Partial<CreatePricingRulePayload>;

export type PricingRuleOrdering =
  | "band_min"
  | "-band_min"
  | "band_max"
  | "-band_max"
  | "age_min"
  | "-age_min"
  | "created_at"
  | "-created_at";

/** Query params for `GET /motor/pricing-rules/`. */
export interface PricingRuleListParams {
  page?: number;
  /** MotorInsuranceProduct uuid. */
  motor_insurance_product?: string;
  rate_calculation_method?: RateCalculationMethod;
  is_active?: boolean;
  ordering?: PricingRuleOrdering;
}

/** Backend `ExtraChargeMethod`; identical values to `ChargeType`. */
export type ExtraChargeMethod = ChargeType;

/** Standalone extra charge from `/motor/extra-charges/`. */
export interface MotorExtraCharge extends ExtraCharge {
  /** MotorInsuranceProduct uuid. */
  motor_insurance_product: string;
  is_active: boolean;
}

/** Body for `POST /motor/extra-charges/` (admin only). */
export interface CreateExtraChargePayload extends ExtraChargePayload {
  /** MotorInsuranceProduct uuid. */
  motor_insurance_product: string;
  is_active?: boolean;
}

/** Body for `PATCH /motor/extra-charges/{id}/` (admin only). */
export type UpdateExtraChargePayload = Partial<CreateExtraChargePayload>;

/** Query params for `GET /motor/extra-charges/`. */
export interface ExtraChargeListParams {
  page?: number;
  /** MotorInsuranceProduct uuid. */
  motor_insurance_product?: string;
  code?: ExtraChargeCode;
  method?: ExtraChargeMethod;
  is_active?: boolean;
}

/** Query params for `GET /motor/products/`. */
export interface MotorProductListParams {
  page?: number;
  search?: string;
  /** CoverType uuid. */
  cover_type?: string;
  /** InsuranceProvider id. */
  insurer?: number;
  /** VehicleClass uuid. */
  vehicle_class?: string;
}

export interface SelectedBenefit {
  product_benefit_id: string;
  extra_limit?: string;
}

export interface InlineVehiclePayload {
  registration_no: string;
  year_of_manufacture: number;
  vehicle_model_id?: string;
  vehicle_class_id?: string;
  seats?: number;
  tonnage?: string;
  engine_cc?: number;
  colour?: string;
  has_tracker?: boolean;
}

export interface CreateQuotePayload {
  customer_id?: string;
  customer?: InlineCustomer;
  vehicle_id?: string;
  vehicle?: InlineVehiclePayload;
  motor_insurance_product_id: string;
  sum_insured: string;
  cover_start: string;
  cover_end: string;
  valid_until?: string;
  selected_benefits?: SelectedBenefit[];
}

export interface QuoteCustomer {
  id: string;
  full_name: string;
  customer_type: CustomerType;
  national_identifier: string;
  national_identifier_type: NationalIdentifierType;
  phone: string | null;
  email: string | null;
  kra_pin: string | null;
}

export interface QuoteLine {
  id: string;
  line_type: string;
  ref_id: number | null;
  description: string;
  amount: string;
  included_benefit_amount: string | null;
  extra_benefit_amount: string | null;
}

export interface QuoteInstallment {
  id: string;
  installment_number: number;
  total_installments: number;
  amount: string;
  amount_paid: string;
  number_of_days_to_extend_policy: number;
  is_final_installment: boolean;
  requires_valid_valuation: boolean;
}

export interface Quote {
  id: string;
  customer: QuoteCustomer;
  vehicle: Vehicle;
  motor_insurance_product: MotorInsuranceProduct;
  sum_insured: string;
  cover_start: string;
  cover_end: string;
  valid_until: string | null;
  basic_premium: string;
  extra_benefits_total: string;
  extra_charges_total: string;
  total_payable: string;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "EXPIRED" | "DECLINED" | "REFERRED";
  system_generated: boolean;
  created_at: string;
  updated_at: string;
  lines: QuoteLine[];
  installments: QuoteInstallment[];
}

/* ================================
   QUOTE COMPARISON (public)
   `POST /motor/quote-comparisons/` — read-only, nothing is saved.
================================ */

export type QuoteLineType = "BASIC_PREMIUM" | "BENEFIT" | "EXTRA_CHARGE";

/** Vehicle details used only for pricing. */
export interface QuoteComparisonVehicle {
  /** Optional; not used for pricing. */
  registration_no?: string | null;
  /** Optional; not used for pricing. */
  vehicle_model_id?: string | null;
  /** Used to match the pricing rule age band. */
  year_of_manufacture: number;
  /** Required by products whose band_type is SEATS. */
  seats?: number | null;
  /** Decimal string. Required by products whose band_type is TONNAGE. */
  tonnage?: string | null;
}

export interface ComparisonSelectedBenefit {
  /** Generic Benefit id (not ProductBenefit). */
  benefit_id: string;
  /** Decimal string. */
  extra_limit?: string | null;
}

export interface QuoteComparisonPayload {
  vehicle_class_id: string;
  cover_type_id: string;
  /** InsuranceProvider ids. Omit to quote every active provider. */
  provider_ids?: InsuranceProvider["id"][];
  /** Decimal string, e.g. "1500000.00". */
  sum_insured: string;
  /** ISO date (YYYY-MM-DD). */
  cover_start: string;
  /** ISO date (YYYY-MM-DD). */
  cover_end: string;
  vehicle: QuoteComparisonVehicle;
  selected_benefits?: ComparisonSelectedBenefit[];
}

export interface QuoteComparisonLine {
  line_type: QuoteLineType;
  /** ProductBenefit id (BENEFIT) or ExtraCharge id (EXTRA_CHARGE); null for BASIC_PREMIUM. */
  ref_id: string | null;
  description: string;
  amount: string;
  included_benefit_amount?: string | null;
  extra_benefit_amount?: string | null;
}

/** One provider's price. Money fields are null when `error` is set. */
export interface QuoteComparisonResult {
  provider: InsuranceProvider;
  product_id: string | null;
  product_name: string | null;
  basic_premium: string | null;
  extra_benefits_total: string | null;
  extra_charges_total: string | null;
  total_payable: string | null;
  lines: QuoteComparisonLine[];
  /** Names of requested benefits this product does not offer. */
  unavailable_benefits: string[];
  error?: string | null;
}

export interface QuoteComparisonResponse {
  /** Sorted cheapest first; errored providers last. */
  results: QuoteComparisonResult[];
  lowest_total: string | null;
}
