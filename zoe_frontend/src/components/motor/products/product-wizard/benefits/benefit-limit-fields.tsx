"use client";

import { Col, Form, Row, Switch } from "antd";
import { MoneyInput } from "../fields/money-input";

interface Props {
  /** Row index within the `product_benefits` Form.List. */
  name: number;
}

export function BenefitLimitFields({ name }: Props) {
  return (
    <Row gutter={16}>
      <Col xs={12} md={6}>
        <Form.Item
          label="Included in premium"
          name={[name, "is_included"]}
          valuePropName="checked"
          tooltip="Bundled into the base premium at no extra cost."
        >
          <Switch />
        </Form.Item>
      </Col>
      <Col xs={12} md={6}>
        <Form.Item
          label="Tier based"
          name={[name, "is_tier_based"]}
          valuePropName="checked"
          tooltip="The extra charge is calculated in tiers."
        >
          <Switch />
        </Form.Item>
      </Col>
      <Col xs={24} md={6}>
        <Form.Item label="Free limit" name={[name, "free_limit"]}>
          <MoneyInput placeholder="None" />
        </Form.Item>
      </Col>
      <Col xs={24} md={6}>
        <Form.Item
          label="Max limit"
          name={[name, "max_limit"]}
          dependencies={[["product_benefits", name, "free_limit"]]}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, max?: number | null) {
                const enabled = getFieldValue(["product_benefits", name, "enabled"]) as boolean;
                const free = getFieldValue(["product_benefits", name, "free_limit"]) as number | null;
                if (!enabled || max == null || free == null || max >= free) return Promise.resolve();
                return Promise.reject(new Error("Must be at least the free limit"));
              },
            }),
          ]}
        >
          <MoneyInput placeholder="None" />
        </Form.Item>
      </Col>
    </Row>
  );
}
