"use client";

import { useEffect, useState } from "react";
import { Button, Space, Tag, Tooltip, Typography } from "antd";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { BaseTable } from "@/components/base-table";
import { CreateQuoteModal } from "@/components/motor/quotes/create-quote-modal";
import { QuoteDetailDrawer } from "@/components/motor/quotes/quote-detail-drawer";
import { useQuotesStore } from "@/store/quotes-store";
import type { Quote } from "@/types/motor";

const { Title, Text } = Typography;

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "default",
  SENT: "blue",
  ACCEPTED: "green",
  EXPIRED: "orange",
  DECLINED: "red",
  REFERRED: "purple",
};

export default function QuotesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { quotes, isLoadingQuotes, fetchQuotes } = useQuotesStore();

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const columns: ColumnsType<Quote> = [
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => <Text>{record.customer?.full_name ?? "—"}</Text>,
    },
    {
      title: "Product",
      key: "product",
      render: (_, record) => (
        <Text>{record.motor_insurance_product?.name ?? "—"}</Text>
      ),
    },
    {
      title: "Insurer",
      key: "insurer",
      render: (_, record) => (
        <Text>{record.motor_insurance_product?.insurer?.name ?? "—"}</Text>
      ),
    },
    {
      title: "Sum Insured",
      dataIndex: "sum_insured",
      key: "sum_insured",
      render: (val: string) => <Text>KES {Number(val).toLocaleString()}</Text>,
    },
    {
      title: "Cover Period",
      key: "cover_period",
      render: (_, record) => (
        <Text>
          {record.cover_start} → {record.cover_end}
        </Text>
      ),
    },
    {
      title: "Total Payable",
      dataIndex: "total_payable",
      key: "total_payable",
      render: (val: string) => (
        <Text strong>KES {Number(val).toLocaleString()}</Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (val: string) => (
        <Tag color={STATUS_COLORS[val] ?? "default"}>{val}</Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (val: string) => new Date(val).toLocaleDateString(),
    },
    {
      title: "",
      key: "actions",
      width: 60,
      render: (_, record) => (
        <Tooltip title="View details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => setSelectedId(record.id)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Quotes
          </Title>
          <Text type="secondary">Manage motor insurance quotes.</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateOpen(true)}
        >
          Create Quote
        </Button>
      </div>

      <BaseTable<Quote>
        rowKey="id"
        dataSource={quotes?.results}
        columns={columns}
        loading={isLoadingQuotes}
        pagination={{ total: quotes?.count, pageSize: 15 }}
        scroll={{ x: 1000 }}
      />

      <CreateQuoteModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <QuoteDetailDrawer
        quoteId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </Space>
  );
}
