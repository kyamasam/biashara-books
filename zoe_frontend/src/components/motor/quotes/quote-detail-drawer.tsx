"use client";

import { useQuotesStore } from "@/store/quotes-store";
import type { QuoteInstallment, QuoteLine } from "@/types/motor";
import {
  Col,
  Divider,
  Drawer,
  Row,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import Image from "next/image";
import { useEffect } from "react";

const { Text, Title } = Typography;

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "default",
  SENT: "blue",
  ACCEPTED: "green",
  EXPIRED: "orange",
  DECLINED: "red",
  REFERRED: "purple",
};

const fmt = (val: string | null | undefined) =>
  val ? `KES ${Number(val).toLocaleString()}` : "—";

const fmtPeriod = (start: string | null | undefined, end: string | null | undefined) => {
  if (!start || !end) return null;
  const days = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000);
  if (days <= 0) return null;
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  return parts.length ? parts.join(" ") : `${days} days`;
};

interface Props {
  quoteId: string | null;
  onClose: () => void;
}

export function QuoteDetailDrawer({ quoteId, onClose }: Props) {
  const { selectedQuote: quote, isLoadingQuote, fetchQuote, clearSelectedQuote } =
    useQuotesStore();

  useEffect(() => {
    if (quoteId) fetchQuote(quoteId);
    else clearSelectedQuote();
  }, [quoteId, fetchQuote, clearSelectedQuote]);

  const handleClose = () => {
    clearSelectedQuote();
    onClose();
  };

  const product = quote?.motor_insurance_product;
  const insurer = product?.insurer;
  const logoUrl = insurer?.logo ?? null;

  const lineColumns: ColumnsType<QuoteLine> = [
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Type",
      dataIndex: "line_type",
      key: "line_type",
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: "Coverage",
      key: "coverage",
      render: (_: unknown, row: QuoteLine) => {
        if (row.line_type !== "BENEFIT") return "—";
        if (row.extra_benefit_amount) {
          return (
            <span>
              {fmt(row.included_benefit_amount)} <Text type="secondary">(included)</Text>
              {" + "}
              {fmt(row.extra_benefit_amount)} <Text type="secondary">(extra)</Text>
            </span>
          );
        }
        return fmt(row.included_benefit_amount);
      },
    },
    {
      title: "Charge",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (v: string) => fmt(v),
    },
  ];

  const installmentColumns: ColumnsType<QuoteInstallment> = [
    {
      title: "#",
      key: "no",
      width: 50,
      render: (_, r) => `${r.installment_number} / ${r.total_installments}`,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (v: string) => fmt(v),
    },
    {
      title: "Paid",
      dataIndex: "amount_paid",
      key: "amount_paid",
      render: (v: string) => fmt(v),
    },
    {
      title: "Extends (days)",
      dataIndex: "number_of_days_to_extend_policy",
      key: "days",
    },
    {
      title: "Final",
      dataIndex: "is_final_installment",
      key: "final",
      render: (v: boolean) => (v ? <Tag color="green">Yes</Tag> : "—"),
    },
  ];

  return (
    <Drawer
      open={!!quoteId}
      onClose={handleClose}
      title="Quote Details"
      width={680}
      destroyOnClose
    >
      {isLoadingQuote || !quote ? (
        <Skeleton active paragraph={{ rows: 12 }} />
      ) : (
        <Space direction="vertical" size={24} style={{ width: "100%" }}>

          {/* Insurer header */}
          <Row align="middle" gutter={16}>
            {logoUrl ? (
              <Col>
                <Image
                  src={logoUrl}
                  alt={insurer?.name ?? "Insurer"}
                  width={80}
                  height={48}
                  style={{ objectFit: "contain" }}
                  unoptimized
                />
              </Col>
            ) : null}
            <Col flex={1}>
              <Title level={5} style={{ margin: 0 }}>
                {insurer?.name ?? "—"}
              </Title>
              <Text type="secondary">{product?.name}</Text>
            </Col>
            <Col>
              <Tag color={STATUS_COLORS[quote.status] ?? "default"} style={{ fontSize: 13 }}>
                {quote.status}
              </Tag>
            </Col>
          </Row>

          <Divider style={{ margin: 0 }} />

          {/* Customer */}
          <Row gutter={[8, 4]} align="middle">
            <Col span={24}>
              <Text strong style={{ fontSize: 15 }}>{quote.customer?.full_name ?? "—"}</Text>
              {quote.customer?.customer_type && (
                <Tag style={{ marginLeft: 8 }}>{quote.customer.customer_type}</Tag>
              )}
            </Col>
            {quote.customer?.phone && (
              <Col><Text type="secondary">{quote.customer.phone}</Text></Col>
            )}
            {quote.customer?.email && (
              <Col><Text type="secondary">{quote.customer.email}</Text></Col>
            )}
            {quote.customer?.national_identifier && (
              <Col>
                <Text type="secondary">
                  {quote.customer.national_identifier_type ?? "ID"}: {quote.customer.national_identifier}
                </Text>
              </Col>
            )}
            {quote.customer?.kra_pin && (
              <Col><Text type="secondary">KRA: {quote.customer.kra_pin}</Text></Col>
            )}
          </Row>

          <Divider style={{ margin: 0 }} />

          {/* Cover details */}
          <Row gutter={[8, 4]}>
            <Col span={24}>
              <Text strong>{product?.cover_type?.name ?? "—"}</Text>
              {product?.vehicle_class?.name && (
                <Tag style={{ marginLeft: 8 }}>{product.vehicle_class.name}</Tag>
              )}
            </Col>
            {quote.cover_start && (
              <Col>
                <Text type="secondary">{quote.cover_start} → {quote.cover_end}</Text>
                {fmtPeriod(quote.cover_start, quote.cover_end) && (
                  <Tag style={{ marginLeft: 8 }}>{fmtPeriod(quote.cover_start, quote.cover_end)}</Tag>
                )}
              </Col>
            )}
            {quote.valid_until && (
              <Col><Text type="secondary">Valid until {quote.valid_until}</Text></Col>
            )}
          </Row>

          <Divider style={{ margin: 0 }} />

          {/* Vehicle */}
          <Row gutter={[8, 4]} align="middle">
            <Col span={24}>
              <Text strong style={{ fontSize: 15 }}>{quote.vehicle?.registration_no ?? "—"}</Text>
              {quote.vehicle?.vehicle_class?.name && (
                <Tag style={{ marginLeft: 8 }}>{quote.vehicle.vehicle_class.name}</Tag>
              )}
              {quote.vehicle?.has_tracker && (
                <Tag color="green" style={{ marginLeft: 4 }}>Tracker</Tag>
              )}
            </Col>
            <Col>
              <Text type="secondary">
                {[
                  quote.vehicle?.vehicle_model?.vehicle_make?.name,
                  quote.vehicle?.vehicle_model?.name,
                ].filter(Boolean).join(" / ") || "—"}
              </Text>
            </Col>
            {quote.vehicle?.year_of_manufacture && (
              <Col><Text type="secondary">{quote.vehicle.year_of_manufacture}</Text></Col>
            )}
            {quote.vehicle?.colour && (
              <Col><Text type="secondary">{quote.vehicle.colour}</Text></Col>
            )}
            {quote.vehicle?.engine_cc && (
              <Col><Text type="secondary">{quote.vehicle.engine_cc} cc</Text></Col>
            )}
            {quote.vehicle?.seats && (
              <Col><Text type="secondary">{quote.vehicle.seats} seats</Text></Col>
            )}
          </Row>

          <Divider style={{ margin: 0 }} />

          {/* Quote lines */}
          {quote.lines?.length > 0 && (
            <>
              <Table<QuoteLine>
                rowKey="id"
                dataSource={quote.lines}
                columns={lineColumns}
                pagination={false}
                size="small"
              />
              <Row justify="end" style={{ paddingRight: 4 }}>
                <Col>
                  <Text type="secondary" style={{ marginRight: 16 }}>Total Payable</Text>
                  <Text strong style={{ fontSize: 16 }}>{fmt(quote.total_payable)}</Text>
                </Col>
              </Row>
            </>
          )}

          {/* Installments */}
          {quote.installments?.length > 0 && (
            <>
              <Divider orientation="left" style={{ marginBottom: 0 }}>
                Installments
              </Divider>
              <Table<QuoteInstallment>
                rowKey="id"
                dataSource={quote.installments}
                columns={installmentColumns}
                pagination={false}
                size="small"
              />
            </>
          )}

          {/* Premium summary */}
          <Row gutter={[8, 6]}>
            {[
              { label: "Sum Insured", value: quote.sum_insured },
              { label: "Basic Premium", value: quote.basic_premium },
              { label: "Extra Benefits", value: quote.extra_benefits_total },
              { label: "Extra Charges", value: quote.extra_charges_total },
            ].map(({ label, value }) => (
              <Col span={12} key={label}>
                <Row justify="space-between">
                  <Text type="secondary">{label}</Text>
                  <Text>{fmt(value)}</Text>
                </Row>
              </Col>
            ))}
            <Col span={24}>
              <Row justify="space-between" style={{ borderTop: "1px solid #f0f0f0", paddingTop: 6 }}>
                <Text strong>Total Payable</Text>
                <Text strong style={{ fontSize: 15 }}>{fmt(quote.total_payable)}</Text>
              </Row>
            </Col>
          </Row>

        </Space>
      )}
    </Drawer>
  );
}
