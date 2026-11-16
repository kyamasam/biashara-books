"use client";

import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { BaseTable } from "@/components";
import type { BandType, PricingRule } from "@/types/motor";
import { BAND_UNITS, RATE_METHOD_OPTIONS, labelOf } from "../product-wizard/constants";
import { formatMoney, formatRate } from "../product-wizard/format";
import { formatBand } from "./format";

interface Props {
  rules: PricingRule[];
  bandType: BandType;
}

export function PricingRulesTable({ rules, bandType }: Props) {
  const columns: ColumnsType<PricingRule> = [
    {
      title: "#",
      key: "index",
      width: 48,
      render: (_, __, i) => i + 1,
    },
    {
      title: BAND_UNITS[bandType].label,
      key: "band",
      render: (_, r) => `${formatBand(r.band_min, bandType)} – ${formatBand(r.band_max, bandType)}`,
    },
    {
      title: "Vehicle age",
      key: "age",
      render: (_, r) => `${r.age_min} – ${r.age_max} yrs`,
    },
    {
      title: "Rate method",
      dataIndex: "rate_calculation_method",
      key: "rate_calculation_method",
      render: (val: PricingRule["rate_calculation_method"]) => <Tag>{labelOf(RATE_METHOD_OPTIONS, val)}</Tag>,
    },
    {
      title: "Rate",
      key: "rate_value",
      render: (_, r) => formatRate(r.rate_value, r.rate_calculation_method),
    },
    {
      title: "Minimum premium",
      dataIndex: "minimum_premium",
      key: "minimum_premium",
      render: (val: string) => formatMoney(val),
    },
  ];

  return (
    <BaseTable<PricingRule>
      rowKey="id"
      size="small"
      dataSource={rules}
      columns={columns}
      pagination={false}
      scroll={{ x: 720 }}
      locale={{ emptyText: "No pricing rules" }}
    />
  );
}
