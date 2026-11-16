"use client";

import { Button, Empty, Form, Space } from "antd";
import { Plus } from "lucide-react";
import type { ExtraChargeCode } from "@/types/motor";
import { EXTRA_CHARGE_CODE_OPTIONS, newExtraChargeRow } from "../constants";
import { SectionTitle } from "../fields/section-title";
import type { ProductFormValues } from "../types";
import { ExtraChargeRow } from "./extra-charge-row";

export function ExtraChargesList() {
  const form = Form.useFormInstance<ProductFormValues>();
  const rows = Form.useWatch("extra_charges", form) ?? [];

  const codesExcept = (index: number) =>
    rows
      .filter((_, i) => i !== index)
      .map((row) => row?.code)
      .filter((code): code is ExtraChargeCode => !!code);

  return (
    <Form.List name="extra_charges">
      {(fields, { add, remove }) => (
        <div>
          <SectionTitle
            title="Levies"
            description="Statutory charges added on top of the premium."
            extra={
              <Button
                icon={<Plus className="h-4 w-4" />}
                disabled={fields.length >= EXTRA_CHARGE_CODE_OPTIONS.length}
                onClick={() => add(newExtraChargeRow())}
              >
                Add levy
              </Button>
            }
          />
          {fields.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No levies added" />
          ) : (
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              {fields.map((field) => (
                <ExtraChargeRow
                  key={field.key}
                  name={field.name}
                  usedCodes={codesExcept(field.name)}
                  onRemove={() => remove(field.name)}
                />
              ))}
            </Space>
          )}
        </div>
      )}
    </Form.List>
  );
}
