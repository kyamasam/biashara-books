"use client";

import { Button, Card, Descriptions, Space, Typography } from "antd";
import type { DescriptionsProps } from "antd";
import { Pencil } from "lucide-react";
import type { MotorInsuranceProduct } from "@/types/motor";
import { INSTALLMENT_METHOD_OPTIONS, labelOf } from "../product-wizard/constants";
import { formatMoney, formatRate } from "../product-wizard/format";
import { PricingRulesTable } from "./pricing-rules-table";

const { Text } = Typography;

interface Props {
  product: MotorInsuranceProduct;
  onEdit: () => void;
}

export function ProductPricingCard({ product, onEdit }: Props) {
  const items: DescriptionsProps["items"] = [
    { key: "minimum_premium", label: "Minimum premium", children: formatMoney(product.minimum_premium) },
    {
      key: "installments",
      label: "Allowed installments",
      children: product.number_of_allowed_installments ?? "—",
    },
    {
      key: "minimum_installment",
      label: "Minimum installment",
      children: `${formatRate(
        product.minimum_installment_value,
        product.minimum_installment_value_calculation_method
      )} (${labelOf(INSTALLMENT_METHOD_OPTIONS, product.minimum_installment_value_calculation_method)})`,
    },
  ];

  const rules = product.pricing_rules ?? [];

  return (
    <Card
      size="small"
      title="Pricing"
      extra={
        <Button size="small" icon={<Pencil className="h-4 w-4" />} onClick={onEdit}>
          Edit
        </Button>
      }
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} items={items} />
        <div>
          <Text strong>Pricing rules ({rules.length})</Text>
          <div style={{ marginTop: 8 }}>
            <PricingRulesTable rules={rules} bandType={product.band_type} />
          </div>
        </div>
      </Space>
    </Card>
  );
}
