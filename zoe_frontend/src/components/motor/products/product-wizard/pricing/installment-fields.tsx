"use client";

import { Col, Form, InputNumber, Row } from "antd";
import { INSTALLMENT_METHOD_OPTIONS } from "../constants";
import { EnumSelect } from "../fields/enum-select";
import { RateInput } from "../fields/rate-input";
import type { ProductFormValues } from "../types";

export function InstallmentFields() {
  const form = Form.useFormInstance<ProductFormValues>();
  const method = Form.useWatch("minimum_installment_value_calculation_method", form);

  return (
    <Row gutter={16}>
      <Col xs={24} md={8}>
        <Form.Item
          label="Allowed installments"
          name="number_of_allowed_installments"
          rules={[{ required: true, message: "Enter the number of installments" }]}
        >
          <InputNumber min={1} max={12} precision={0} style={{ width: "100%" }} />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item
          label="Minimum installment based on"
          name="minimum_installment_value_calculation_method"
          rules={[{ required: true, message: "Select a method" }]}
        >
          <EnumSelect options={INSTALLMENT_METHOD_OPTIONS} />
        </Form.Item>
      </Col>
      <Col xs={24} md={8}>
        <Form.Item
          label="Minimum installment"
          name="minimum_installment_value"
          rules={[{ required: true, message: "Enter a minimum installment" }]}
        >
          <RateInput method={method} />
        </Form.Item>
      </Col>
    </Row>
  );
}
