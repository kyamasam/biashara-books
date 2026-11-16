"use client";

import { Form, Space, Tag, Typography } from "antd";
import { useBenefitsStore } from "@/store/benefits-store";
import { useCoverTypesStore } from "@/store/cover-types-store";
import { useInsuranceProvidersStore } from "@/store/insurance-providers-store";
import { useVehiclesStore } from "@/store/vehicles-store";
import {
  BAND_TYPE_OPTIONS,
  BAND_UNITS,
  CHARGE_TYPE_OPTIONS,
  EXTRA_CHARGE_CODE_OPTIONS,
  INSTALLMENT_METHOD_OPTIONS,
  labelOf,
} from "../constants";
import { formatMoney, formatRate, formatThousands } from "../format";
import type { ProductFormValues } from "../types";
import { ReviewRow } from "./review-row";
import { ReviewSection } from "./review-section";

const { Text } = Typography;

interface Props {
  onEditStep: (step: number) => void;
}

/** Read-only summary of every wizard section. */
export function ProductReview({ onEditStep }: Props) {
  const form = Form.useFormInstance<ProductFormValues>();
  const values = Form.useWatch((v: ProductFormValues) => v, form);

  const insurers = useInsuranceProvidersStore((s) => s.providers?.results);
  const vehicleClasses = useVehiclesStore((s) => s.vehicleClasses);
  const coverTypes = useCoverTypesStore((s) => s.coverTypes?.results);
  const benefits = useBenefitsStore((s) => s.benefits?.results);

  if (!values) return null;

  const unit = BAND_UNITS[values.band_type ?? "VALUE"];
  const band = (v?: number) =>
    v == null ? "—" : values.band_type === "VALUE" ? formatThousands(v) : String(v);
  const enabledBenefits = (values.product_benefits ?? []).filter((b) => b?.enabled);
  const extraCharges = values.extra_charges ?? [];

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <ReviewSection title="Basics" onEdit={() => onEditStep(0)}>
        <ReviewRow label="Name">{values.name || "—"}</ReviewRow>
        <ReviewRow label="Insurer">
          {insurers?.find((i) => i.id === values.insurer)?.name ?? "—"}
        </ReviewRow>
        <ReviewRow label="Vehicle class">
          {vehicleClasses.find((c) => c.id === values.vehicle_class)?.name ?? "—"}
        </ReviewRow>
        <ReviewRow label="Cover type">
          {coverTypes?.find((c) => c.id === values.cover_type)?.name ?? "—"}
        </ReviewRow>
        <ReviewRow label="Band type">{labelOf(BAND_TYPE_OPTIONS, values.band_type)}</ReviewRow>
        <ReviewRow label="Status">
          {values.is_active ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>}
        </ReviewRow>
      </ReviewSection>

      <ReviewSection title="Pricing" onEdit={() => onEditStep(1)}>
        <ReviewRow label="Minimum premium">{formatMoney(values.minimum_premium)}</ReviewRow>
        <ReviewRow label="Installments">{values.number_of_allowed_installments ?? "—"}</ReviewRow>
        <ReviewRow
          label={`Minimum installment (${labelOf(
            INSTALLMENT_METHOD_OPTIONS,
            values.minimum_installment_value_calculation_method
          )})`}
        >
          {formatRate(
            values.minimum_installment_value,
            values.minimum_installment_value_calculation_method
          )}
        </ReviewRow>
        {(values.pricing_rules ?? []).map((rule, i) => (
          <ReviewRow key={i} label={`Band ${i + 1}`}>
            {`${unit.label}: ${band(rule?.band_min)} – ${band(rule?.band_max)} · Age ${
              rule?.age_min ?? "—"
            }–${rule?.age_max ?? "—"} yrs · ${formatRate(rule?.rate_value, rule?.rate_calculation_method)}`}
          </ReviewRow>
        ))}
      </ReviewSection>

      <ReviewSection title="Benefits" onEdit={() => onEditStep(2)}>
        {enabledBenefits.length === 0 ? (
          <Text type="secondary">No benefits offered</Text>
        ) : (
          enabledBenefits.map((b) => (
            <ReviewRow key={b.benefit} label={benefits?.find((x) => x.id === b.benefit)?.name ?? "Benefit"}>
              {b.is_included ? "Included" : "Optional"}
              {b.charge_type_for_extra
                ? ` · ${labelOf(CHARGE_TYPE_OPTIONS, b.charge_type_for_extra)} ${formatRate(
                    b.charge_value,
                    b.charge_type_for_extra
                  )}`
                : ""}
            </ReviewRow>
          ))
        )}
      </ReviewSection>

      <ReviewSection title="Levies">
        {extraCharges.length === 0 ? (
          <Text type="secondary">No levies</Text>
        ) : (
          extraCharges.map((c, i) => (
            <ReviewRow key={i} label={labelOf(EXTRA_CHARGE_CODE_OPTIONS, c?.code)}>
              {`${formatRate(c?.rate_value, c?.method)} · from ${c?.effective_from ?? "—"}${
                c?.effective_to ? ` to ${c.effective_to}` : ""
              }`}
            </ReviewRow>
          ))
        )}
      </ReviewSection>
    </Space>
  );
}
