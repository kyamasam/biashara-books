"use client";

import { Card, Flex, Form, Switch, Tag, Typography } from "antd";
import type { ProductFormValues } from "../types";
import { BenefitChargeFields } from "./benefit-charge-fields";
import { BenefitLimitFields } from "./benefit-limit-fields";

const { Text } = Typography;

interface Props {
  /** Row index within the `product_benefits` Form.List. */
  name: number;
  title: string;
  code?: string;
}

/** One catalogue benefit; the header switch adds it to the product and reveals its settings. */
export function BenefitCard({ name, title, code }: Props) {
  const form = Form.useFormInstance<ProductFormValues>();
  const enabled = !!Form.useWatch(["product_benefits", name, "enabled"], form);

  return (
    <Card
      size="small"
      title={
        <Flex align="center" gap={8}>
          <Text strong>{title}</Text>
          {code && <Tag bordered={false}>{code}</Tag>}
        </Flex>
      }
      extra={
        <Form.Item name={[name, "enabled"]} valuePropName="checked" noStyle>
          <Switch size="small" aria-label={`Offer ${title}`} />
        </Form.Item>
      }
      styles={{ body: enabled ? undefined : { display: "none" } }}
    >
      <BenefitLimitFields name={name} />
      <BenefitChargeFields name={name} enabled={enabled} />
    </Card>
  );
}
