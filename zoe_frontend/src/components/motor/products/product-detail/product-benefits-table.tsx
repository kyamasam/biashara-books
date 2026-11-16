"use client";

import { Card, Flex, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { BaseTable } from "@/components";
import type { ProductBenefit } from "@/types/motor";
import { CHARGE_TYPE_OPTIONS, labelOf } from "../product-wizard/constants";
import { formatMoney, formatRate } from "../product-wizard/format";

const { Text } = Typography;

interface Props {
  benefits: ProductBenefit[];
}

const columns: ColumnsType<ProductBenefit> = [
  {
    title: "Benefit",
    key: "benefit",
    render: (_, r) => (
      <Flex vertical>
        <Text strong>{r.benefit?.name ?? "—"}</Text>
        {r.benefit?.code && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.benefit.code}
          </Text>
        )}
      </Flex>
    ),
  },
  {
    title: "Inclusion",
    dataIndex: "is_included",
    key: "is_included",
    render: (val: boolean) => (val ? <Tag color="green">Included</Tag> : <Tag>Optional</Tag>),
  },
  { title: "Free limit", dataIndex: "free_limit", key: "free_limit", render: (v: string | null) => formatMoney(v) },
  { title: "Max limit", dataIndex: "max_limit", key: "max_limit", render: (v: string | null) => formatMoney(v) },
  {
    title: "Tier based",
    dataIndex: "is_tier_based",
    key: "is_tier_based",
    render: (val: boolean) => (val ? "Yes" : "No"),
  },
  {
    title: "Extra charged as",
    dataIndex: "charge_type_for_extra",
    key: "charge_type_for_extra",
    render: (val: ProductBenefit["charge_type_for_extra"]) => (val ? labelOf(CHARGE_TYPE_OPTIONS, val) : "—"),
  },
  {
    title: "Charge",
    key: "charge_value",
    render: (_, r) => (r.charge_type_for_extra ? formatRate(r.charge_value, r.charge_type_for_extra) : "—"),
  },
];

export function ProductBenefitsTable({ benefits }: Props) {
  return (
    <Card size="small" title={`Benefits (${benefits.length})`}>
      <BaseTable<ProductBenefit>
        rowKey="id"
        size="small"
        dataSource={benefits}
        columns={columns}
        pagination={false}
        scroll={{ x: 820 }}
        locale={{ emptyText: "No benefits offered" }}
      />
    </Card>
  );
}
