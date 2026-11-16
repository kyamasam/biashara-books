"use client";

import { Button, Card, Col, Form, Row } from "antd";
import { Trash2 } from "lucide-react";
import type { BandType } from "@/types/motor";
import { BAND_UNITS, RATE_METHOD_OPTIONS } from "../constants";
import { EnumSelect } from "../fields/enum-select";
import { MoneyInput } from "../fields/money-input";
import { RateInput } from "../fields/rate-input";
import type { ProductFormValues } from "../types";
import { RangeFields } from "./range-fields";

interface Props {
  name: number;
  index: number;
  bandType: BandType;
  onRemove: () => void;
}

export function PricingRuleRow({ name, index, bandType, onRemove }: Props) {
  const form = Form.useFormInstance<ProductFormValues>();
  const method = Form.useWatch(["pricing_rules", name, "rate_calculation_method"], form);
  const unit = BAND_UNITS[bandType];

  return (
    <Card
      size="small"
      title={`Band ${index + 1}`}
      extra={
        <Button
          type="text"
          danger
          size="small"
          aria-label={`Remove band ${index + 1}`}
          icon={<Trash2 className="h-4 w-4" />}
          onClick={onRemove}
        />
      }
    >
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <RangeFields
            listName="pricing_rules"
            name={name}
            minKey="band_min"
            maxKey="band_max"
            label={unit.label}
            prefix={unit.prefix}
            suffix={unit.suffix}
            precision={unit.precision}
            thousands={bandType === "VALUE"}
          />
        </Col>
        <Col xs={24} md={12}>
          <RangeFields
            listName="pricing_rules"
            name={name}
            minKey="age_min"
            maxKey="age_max"
            label="Vehicle age (years)"
            suffix="yrs"
          />
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="Rate method"
            name={[name, "rate_calculation_method"]}
            rules={[{ required: true, message: "Select a rate method" }]}
          >
            <EnumSelect options={RATE_METHOD_OPTIONS} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="Rate"
            name={[name, "rate_value"]}
            rules={[{ required: true, message: "Enter a rate" }]}
          >
            <RateInput method={method} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Band minimum premium" name={[name, "minimum_premium"]}>
            <MoneyInput />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
}
