"use client";

import { useCallback, useMemo, useRef } from "react";
import { Form } from "antd";
import { useMotorProductsStore } from "@/store/motor-products-store";
import { usePricingRulesStore } from "@/store/pricing-rules-store";
import type {
  MotorInsuranceProduct,
  PricingRulePayload,
  UpdateMotorProductPayload,
} from "@/types/motor";
import { pricingRuleToPayload, productToFormValues } from "../../product-wizard/mappers";
import { parseServerFieldErrors, type FieldPath } from "../../product-wizard/server-errors";
import type { ProductFormValues } from "../../product-wizard/types";

/** `band_type` is only carried so `PricingRulesList` can label the bands; it is never saved here. */
export type PricingEditFormValues = Pick<
  ProductFormValues,
  | "band_type"
  | "minimum_premium"
  | "number_of_allowed_installments"
  | "minimum_installment_value"
  | "minimum_installment_value_calculation_method"
  | "pricing_rules"
>;

type ProductPricingPayload = Pick<
  UpdateMotorProductPayload,
  | "minimum_premium"
  | "number_of_allowed_installments"
  | "minimum_installment_value"
  | "minimum_installment_value_calculation_method"
>;

/** What is currently persisted; updated after every successful call so a retry never repeats work. */
interface Baseline {
  product: ProductPricingPayload;
  rules: Map<string, PricingRulePayload>;
}

interface Options {
  product: MotorInsuranceProduct;
  onSuccess?: () => void;
}

const decReq = (v: number | null | undefined) => (v === null || v === undefined ? "0" : String(v));

const toProductPayload = (v: PricingEditFormValues): ProductPricingPayload => ({
  minimum_premium: decReq(v.minimum_premium),
  number_of_allowed_installments: v.number_of_allowed_installments ?? undefined,
  minimum_installment_value: decReq(v.minimum_installment_value),
  minimum_installment_value_calculation_method: v.minimum_installment_value_calculation_method,
});

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const toInitialValues = (product: MotorInsuranceProduct): PricingEditFormValues => {
  const v = productToFormValues(product);
  return {
    band_type: v.band_type,
    minimum_premium: v.minimum_premium,
    number_of_allowed_installments: v.number_of_allowed_installments,
    minimum_installment_value: v.minimum_installment_value,
    minimum_installment_value_calculation_method: v.minimum_installment_value_calculation_method,
    pricing_rules: v.pricing_rules,
  };
};

/** Both sides go through the same form → payload mapping so "10.00" and 10 compare equal. */
const toBaseline = (values: PricingEditFormValues): Baseline => ({
  product: toProductPayload(values),
  rules: new Map(
    values.pricing_rules.filter((r) => r.id).map((r) => [r.id!, pricingRuleToPayload(r)])
  ),
});

/**
 * Scoped pricing editor: product-level fields go through `updateProduct` (only those 4 fields),
 * rules are diffed by id and saved via the standalone pricing-rule endpoints so ids survive.
 */
export function usePricingEdit({ product, onSuccess }: Options) {
  const [form] = Form.useForm<PricingEditFormValues>();
  const baselineRef = useRef<Baseline | null>(null);

  const isSavingProduct = useMotorProductsStore((s) => s.isSavingProduct);
  const updateProduct = useMotorProductsStore((s) => s.updateProduct);
  const isMutating = usePricingRulesStore((s) => s.isMutating);
  const createPricingRule = usePricingRulesStore((s) => s.createPricingRule);
  const updatePricingRule = usePricingRulesStore((s) => s.updatePricingRule);
  const deletePricingRule = usePricingRulesStore((s) => s.deletePricingRule);

  const initialValues = useMemo(() => toInitialValues(product), [product]);

  const reset = useCallback(() => {
    form.resetFields();
    baselineRef.current = null;
  }, [form]);

  const submit = useCallback(async () => {
    try {
      await form.validateFields();
    } catch {
      // Inline errors are shown by the form.
      return;
    }

    const values = form.getFieldsValue(true) as PricingEditFormValues;
    const rows = values.pricing_rules ?? [];
    const baseline = (baselineRef.current ??= toBaseline(initialValues));
    // Field path prefix for errors from the call in flight (rule calls point at their row).
    let errorPrefix: FieldPath = [];

    try {
      const productPayload = toProductPayload(values);
      if (!sameJson(productPayload, baseline.product)) {
        await updateProduct(product.id, productPayload);
        baseline.product = productPayload;
      }

      const keptIds = new Set(rows.map((r) => r.id).filter(Boolean));
      for (const id of [...baseline.rules.keys()].filter((id) => !keptIds.has(id))) {
        errorPrefix = [];
        await deletePricingRule(id, { refetch: false });
        baseline.rules.delete(id);
      }

      for (const [index, row] of rows.entries()) {
        if (!row.id) continue;
        const payload = pricingRuleToPayload(row);
        if (sameJson(payload, baseline.rules.get(row.id))) continue;
        errorPrefix = ["pricing_rules", index];
        await updatePricingRule(row.id, payload);
        baseline.rules.set(row.id, payload);
      }

      for (const [index, row] of rows.entries()) {
        if (row.id) continue;
        const payload = pricingRuleToPayload(row);
        errorPrefix = ["pricing_rules", index];
        const created = await createPricingRule(
          { ...payload, motor_insurance_product: product.id },
          { refetch: false }
        );
        // Record the new id so a retry after a later failure updates instead of duplicating.
        form.setFieldValue(["pricing_rules", index, "id"], created.id);
        baseline.rules.set(created.id, payload);
      }
    } catch (err) {
      // The axios interceptor already toasts the error; map it onto fields too.
      const fieldErrors = parseServerFieldErrors(err).map((e) => ({
        ...e,
        name: [...errorPrefix, ...e.name],
      }));
      form.setFields(fieldErrors as Parameters<typeof form.setFields>[0]);
      return;
    }

    reset();
    onSuccess?.();
  }, [
    createPricingRule,
    deletePricingRule,
    form,
    initialValues,
    onSuccess,
    product.id,
    reset,
    updatePricingRule,
    updateProduct,
  ]);

  return {
    form,
    initialValues,
    isSaving: isSavingProduct || isMutating,
    reset,
    submit,
  };
}
