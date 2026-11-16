"use client";

import { useCallback, useMemo, useState } from "react";
import { Form } from "antd";
import { useMotorProductsStore } from "@/store/motor-products-store";
import type { MotorInsuranceProduct } from "@/types/motor";
import { DEFAULT_FORM_VALUES, LAST_STEP, STEPS } from "./constants";
import { formValuesToPayload, productToFormValues } from "./mappers";
import { parseServerFieldErrors, type FieldPath } from "./server-errors";
import type { ProductFormValues, WizardMode } from "./types";

interface Options {
  /** Edit provision: when set, the wizard pre-fills and calls `updateProduct`. */
  product?: MotorInsuranceProduct | null;
  onSuccess?: (product: MotorInsuranceProduct) => void;
}

interface ValidateError {
  errorFields?: Array<{ name: FieldPath }>;
}

const stepOf = (name: FieldPath) =>
  STEPS.findIndex((s) => s.fields.includes(name[0] as keyof ProductFormValues));

export function useProductWizard({ product, onSuccess }: Options = {}) {
  const [form] = Form.useForm<ProductFormValues>();
  const [current, setCurrent] = useState(0);

  const isSaving = useMotorProductsStore((s) => s.isSavingProduct);
  const createProduct = useMotorProductsStore((s) => s.createProduct);
  const updateProduct = useMotorProductsStore((s) => s.updateProduct);

  const mode: WizardMode = product ? "edit" : "create";
  const initialValues = useMemo(
    () => (product ? productToFormValues(product) : DEFAULT_FORM_VALUES),
    [product]
  );

  const jumpToFirstError = useCallback((names: FieldPath[]) => {
    const steps = names.map(stepOf).filter((i) => i >= 0);
    if (steps.length) setCurrent(Math.min(...steps));
  }, []);

  const next = useCallback(async () => {
    try {
      await form.validateFields(STEPS[current].fields, { recursive: true });
      setCurrent((c) => Math.min(c + 1, LAST_STEP));
    } catch {
      // Inline errors are shown by the form.
    }
  }, [current, form]);

  const prev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

  /** Only completed (earlier) steps can be jumped to. */
  const goTo = useCallback((step: number) => {
    setCurrent((c) => (step < c ? step : c));
  }, []);

  const reset = useCallback(() => {
    form.resetFields();
    setCurrent(0);
  }, [form]);

  const submit = useCallback(async () => {
    try {
      await form.validateFields();
    } catch (err) {
      jumpToFirstError((err as ValidateError).errorFields?.map((f) => f.name) ?? []);
      return;
    }

    const payload = formValuesToPayload(form.getFieldsValue(true) as ProductFormValues);
    try {
      const saved = product
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);
      reset();
      onSuccess?.(saved);
    } catch (err) {
      // The axios interceptor already toasts the error; map it onto fields too.
      const fieldErrors = parseServerFieldErrors(err);
      form.setFields(fieldErrors as Parameters<typeof form.setFields>[0]);
      jumpToFirstError(fieldErrors.map((e) => e.name));
    }
  }, [createProduct, form, jumpToFirstError, onSuccess, product, reset, updateProduct]);

  return {
    form,
    mode,
    current,
    isSaving,
    initialValues,
    isLastStep: current === LAST_STEP,
    next,
    prev,
    goTo,
    reset,
    submit,
  };
}
