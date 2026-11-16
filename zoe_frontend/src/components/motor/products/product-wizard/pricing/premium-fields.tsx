"use client";

import { Form } from "antd";
import { MoneyInput } from "../fields/money-input";

export function PremiumFields() {
  return (
    <Form.Item
      label="Minimum premium"
      name="minimum_premium"
      tooltip="The lowest premium this product will ever charge, regardless of band."
      rules={[{ required: true, message: "Enter a minimum premium" }]}
    >
      <MoneyInput />
    </Form.Item>
  );
}
