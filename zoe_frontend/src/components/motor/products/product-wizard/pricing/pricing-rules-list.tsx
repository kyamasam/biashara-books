"use client";

import { Button, Empty, Form, Space } from "antd";
import { Plus } from "lucide-react";
import { DEFAULT_PRICING_RULE } from "../constants";
import { SectionTitle } from "../fields/section-title";
import type { PricingRuleFormValues, ProductFormValues } from "../types";
import { PricingRuleRow } from "./pricing-rule-row";

export function PricingRulesList() {
  const form = Form.useFormInstance<ProductFormValues>();
  const bandType = Form.useWatch("band_type", form) ?? "VALUE";

  return (
    <Form.List
      name="pricing_rules"
      rules={[
        {
          validator: async (_, rules?: PricingRuleFormValues[]) => {
            if (!rules?.length) throw new Error("Add at least one pricing band");
          },
        },
      ]}
    >
      {(fields, { add, remove }, { errors }) => (
        <div>
          <SectionTitle
            title="Pricing bands"
            description="Each band sets the rate for a range of vehicles and vehicle ages."
            extra={
              <Button
                icon={<Plus className="h-4 w-4" />}
                onClick={() => add({ ...DEFAULT_PRICING_RULE })}
              >
                Add band
              </Button>
            }
          />
          {fields.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No pricing bands yet" />
          ) : (
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              {fields.map((field, index) => (
                <PricingRuleRow
                  key={field.key}
                  name={field.name}
                  index={index}
                  bandType={bandType}
                  onRemove={() => remove(field.name)}
                />
              ))}
            </Space>
          )}
          <Form.ErrorList errors={errors} />
        </div>
      )}
    </Form.List>
  );
}
