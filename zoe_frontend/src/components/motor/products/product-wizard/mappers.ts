import type {
  ExtraChargePayload,
  MotorInsuranceProduct,
  MotorProductPayload,
  PricingRulePayload,
  ProductBenefitPayload,
} from "@/types/motor";
import type {
  ExtraChargeFormValues,
  PricingRuleFormValues,
  ProductBenefitFormValues,
  ProductFormValues,
} from "./types";

const isBlank = (v: number | null | undefined): v is null | undefined =>
  v === null || v === undefined;

/** Decimal for an optional field: omitted when blank. */
const dec = (v: number | null | undefined) => (isBlank(v) ? undefined : String(v));
/** Decimal for a nullable field: null when blank. */
const decOrNull = (v: number | null | undefined) => (isBlank(v) ? null : String(v));
/** Decimal for a required field. */
const decReq = (v: number | null | undefined) => (isBlank(v) ? "0" : String(v));

const num = (v: string | null | undefined) =>
  v === null || v === undefined || v === "" ? undefined : Number(v);

/** Form rule → API payload. Ignores `id`. */
export const pricingRuleToPayload = (r: PricingRuleFormValues): PricingRulePayload => ({
  band_min: dec(r.band_min),
  band_max: dec(r.band_max),
  age_min: r.age_min ?? undefined,
  age_max: r.age_max ?? undefined,
  rate_calculation_method: r.rate_calculation_method,
  rate_value: decReq(r.rate_value),
  minimum_premium: dec(r.minimum_premium),
});

const benefitToPayload = (b: ProductBenefitFormValues): ProductBenefitPayload => ({
  benefit: b.benefit,
  is_included: b.is_included,
  free_limit: decOrNull(b.free_limit),
  max_limit: decOrNull(b.max_limit),
  is_tier_based: b.is_tier_based,
  charge_type_for_extra: b.charge_type_for_extra ?? undefined,
  charge_value: decOrNull(b.charge_value),
});

const extraChargeToPayload = (c: ExtraChargeFormValues): ExtraChargePayload => ({
  code: c.code!,
  method: c.method,
  rate_value: decReq(c.rate_value),
  effective_from: c.effective_from!,
  effective_to: c.effective_to || null,
});

/** Converts validated form values into the API payload (numbers → strings, disabled benefits dropped). */
export function formValuesToPayload(values: ProductFormValues): MotorProductPayload {
  return {
    name: values.name?.trim() ?? "",
    insurer: values.insurer!,
    vehicle_class: values.vehicle_class!,
    cover_type: values.cover_type!,
    band_type: values.band_type,
    is_active: values.is_active,
    minimum_premium: decReq(values.minimum_premium),
    number_of_allowed_installments: values.number_of_allowed_installments ?? undefined,
    minimum_installment_value: decReq(values.minimum_installment_value),
    minimum_installment_value_calculation_method: values.minimum_installment_value_calculation_method,
    pricing_rules: (values.pricing_rules ?? []).map(pricingRuleToPayload),
    product_benefits: (values.product_benefits ?? []).filter((b) => b.enabled).map(benefitToPayload),
    extra_charges: (values.extra_charges ?? []).map(extraChargeToPayload),
  };
}

/** Edit provision: maps an API product back into form values. Not wired yet. */
export function productToFormValues(product: MotorInsuranceProduct): ProductFormValues {
  return {
    name: product.name,
    insurer: product.insurer.id,
    vehicle_class: product.vehicle_class.id,
    cover_type: product.cover_type.id,
    band_type: product.band_type,
    is_active: product.is_active ?? true,
    minimum_premium: num(product.minimum_premium),
    number_of_allowed_installments: product.number_of_allowed_installments,
    minimum_installment_value: num(product.minimum_installment_value),
    minimum_installment_value_calculation_method: product.minimum_installment_value_calculation_method,
    pricing_rules: product.pricing_rules.map((r) => ({
      id: r.id,
      band_min: num(r.band_min),
      band_max: num(r.band_max),
      age_min: r.age_min,
      age_max: r.age_max,
      rate_calculation_method: r.rate_calculation_method,
      rate_value: num(r.rate_value),
      minimum_premium: num(r.minimum_premium),
    })),
    product_benefits: product.product_benefits.map((b) => ({
      benefit: b.benefit.id,
      enabled: true,
      is_included: b.is_included,
      free_limit: num(b.free_limit) ?? null,
      max_limit: num(b.max_limit) ?? null,
      is_tier_based: b.is_tier_based,
      charge_type_for_extra: b.charge_type_for_extra || null,
      charge_value: num(b.charge_value) ?? null,
    })),
    extra_charges: product.extra_charges.map((c) => ({
      code: c.code,
      method: c.method,
      rate_value: num(c.rate_value),
      effective_from: c.effective_from,
      effective_to: c.effective_to,
    })),
  };
}
