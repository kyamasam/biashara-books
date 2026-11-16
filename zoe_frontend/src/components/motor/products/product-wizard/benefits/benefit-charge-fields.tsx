"use client";

import { Col, Form, Row } from "antd";
import { CHARGE_TYPE_OPTIONS } from "../constants";
import { EnumSelect } from "../fields/enum-select";
import { RateInput } from "../fields/rate-input";
import type { ProductFormValues } from "../types";

interface Props {
  /** Row index within the `product_benefits` Form.List. */
  name: number;
  enabled: boolean;
}

export function BenefitChargeFields({ name, enabled }: Props) {
  const form = Form.useFormInstance<ProductFormValues>();
  const chargeType = Form.useWatch(["product_benefits", name, "charge_type_for_extra"], form);

  return (
    <Row gutter={16}>
      <Col xs={24} md={12}>
        <Form.Item label="Charge for extra cover" name={[name, "charge_type_for_extra"]}>
          <EnumSelect options={CHARGE_TYPE_OPTIONS} allowClear placeholder="No extra charge" />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          label="Charge value"
          name={[name, "charge_value"]}
          dependencies={[["product_benefits", name, "charge_type_for_extra"]]}
          rules={[
            {
              required: enabled && !!chargeType,
              message: "Enter the charge value",
            },
          ]}
        >
          <RateInput method={chargeType} disabled={!chargeType} />
        </Form.Item>
      </Col>
    </Row>
  );
}
