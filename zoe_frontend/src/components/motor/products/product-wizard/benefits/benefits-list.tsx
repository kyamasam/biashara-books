"use client";

import { useEffect, useMemo } from "react";
import { Empty, Form, Space, Spin } from "antd";
import { useBenefitsStore } from "@/store/benefits-store";
import type { Benefit } from "@/types/motor";
import { newBenefitRow } from "../constants";
import type { ProductBenefitFormValues, ProductFormValues } from "../types";
import { BenefitCard } from "./benefit-card";

/** Catalogue rows first (existing settings kept), then any existing rows not in the catalogue. */
const mergeRows = (catalogue: Benefit[], existing: ProductBenefitFormValues[]) => {
  const byId = new Map(existing.map((row) => [row.benefit, row]));
  const seeded = catalogue.map((b) => byId.get(b.id) ?? newBenefitRow(b.id));
  const catalogueIds = new Set(catalogue.map((b) => b.id));
  return [...seeded, ...existing.filter((row) => !catalogueIds.has(row.benefit))];
};

export function BenefitsList() {
  const form = Form.useFormInstance<ProductFormValues>();
  const benefits = useBenefitsStore((s) => s.benefits);
  const isLoading = useBenefitsStore((s) => s.isLoadingBenefits);
  const fetchBenefits = useBenefitsStore((s) => s.fetchBenefits);

  // Seed one row per catalogue benefit once our own fetch resolves (ignores stale store data).
  useEffect(() => {
    let cancelled = false;
    fetchBenefits({ page: 1, search: "", is_active: true })
      .then(() => {
        const catalogue = useBenefitsStore.getState().benefits?.results ?? [];
        if (cancelled) return;
        const existing = (form.getFieldValue("product_benefits") ?? []) as ProductBenefitFormValues[];
        form.setFieldValue("product_benefits", mergeRows(catalogue, existing));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [fetchBenefits, form]);

  const catalogueById = useMemo(
    () => new Map((benefits?.results ?? []).map((b) => [b.id, b])),
    [benefits]
  );

  return (
    <Spin spinning={isLoading}>
      <Form.List name="product_benefits">
        {(fields) =>
          fields.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={isLoading ? "Loading benefits…" : "No active benefits in the catalogue"}
            />
          ) : (
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              {fields.map((field) => {
                const id = form.getFieldValue(["product_benefits", field.name, "benefit"]) as string;
                const benefit = catalogueById.get(id);
                return (
                  <BenefitCard
                    key={field.key}
                    name={field.name}
                    title={benefit?.name ?? "Benefit"}
                    code={benefit?.code}
                  />
                );
              })}
            </Space>
          )
        }
      </Form.List>
    </Spin>
  );
}
