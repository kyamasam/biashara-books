"use client";

import { Card, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { BaseTable } from "@/components";
import type { ExtraCharge } from "@/types/motor";
import { CHARGE_TYPE_OPTIONS, EXTRA_CHARGE_CODE_OPTIONS, labelOf } from "../product-wizard/constants";
import { formatRate } from "../product-wizard/format";
import { formatDate } from "./format";

interface Props {
  charges: ExtraCharge[];
}

const columns: ColumnsType<ExtraCharge> = [
  {
    title: "Levy",
    dataIndex: "code",
    key: "code",
    render: (val: ExtraCharge["code"]) => labelOf(EXTRA_CHARGE_CODE_OPTIONS, val),
  },
  {
    title: "Method",
    dataIndex: "method",
    key: "method",
    render: (val: ExtraCharge["method"]) => <Tag>{labelOf(CHARGE_TYPE_OPTIONS, val)}</Tag>,
  },
  { title: "Rate", key: "rate_value", render: (_, r) => formatRate(r.rate_value, r.method) },
  {
    title: "Effective from",
    dataIndex: "effective_from",
    key: "effective_from",
    render: (val: string) => formatDate(val),
  },
  {
    title: "Effective to",
    dataIndex: "effective_to",
    key: "effective_to",
    render: (val: string | null) => (val ? formatDate(val) : <Tag color="blue">Open-ended</Tag>),
  },
];

export function ExtraChargesTable({ charges }: Props) {
  return (
    <Card size="small" title={`Levies & extra charges (${charges.length})`}>
      <BaseTable<ExtraCharge>
        rowKey="id"
        size="small"
        dataSource={charges}
        columns={columns}
        pagination={false}
        scroll={{ x: 640 }}
        locale={{ emptyText: "No levies" }}
      />
    </Card>
  );
}
