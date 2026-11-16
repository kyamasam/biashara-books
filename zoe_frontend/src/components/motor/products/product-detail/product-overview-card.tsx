"use client";

import { Avatar, Card, Descriptions, Flex, Tag, Typography } from "antd";
import type { DescriptionsProps } from "antd";
import type { MotorInsuranceProduct } from "@/types/motor";
import { BAND_TYPE_OPTIONS, labelOf } from "../product-wizard/constants";
import { formatDate } from "./format";
import { StatusTag } from "./status-tag";

const { Text } = Typography;

interface Props {
  product: MotorInsuranceProduct;
}

const NameWithCode = ({ name, code }: { name?: string; code?: string }) => (
  <Flex align="center" gap={6} wrap>
    <Text>{name ?? "—"}</Text>
    {code && <Tag>{code}</Tag>}
  </Flex>
);

export function ProductOverviewCard({ product }: Props) {
  const { insurer } = product;

  const items: DescriptionsProps["items"] = [
    { key: "name", label: "Name", children: product.name },
    {
      key: "insurer",
      label: "Insurer",
      children: insurer ? (
        <Flex align="center" gap={8}>
          {insurer.logo && <Avatar size="small" src={insurer.logo} alt={insurer.name} />}
          <Text>{insurer.name}</Text>
        </Flex>
      ) : (
        "—"
      ),
    },
    {
      key: "vehicle_class",
      label: "Vehicle class",
      children: <NameWithCode name={product.vehicle_class?.name} code={product.vehicle_class?.code} />,
    },
    {
      key: "cover_type",
      label: "Cover type",
      children: <NameWithCode name={product.cover_type?.name} code={product.cover_type?.code} />,
    },
    {
      key: "band_type",
      label: "Band type",
      children: <Tag>{labelOf(BAND_TYPE_OPTIONS, product.band_type)}</Tag>,
    },
    { key: "status", label: "Status", children: <StatusTag isActive={product.is_active} /> },
    {
      key: "valuation_validity",
      label: "Valuation validity",
      children:
        insurer?.valuation_validity_days == null ? "No limit" : `${insurer.valuation_validity_days} days`,
    },
    { key: "created_at", label: "Created", children: formatDate(product.created_at, true) },
    { key: "updated_at", label: "Last updated", children: formatDate(product.updated_at, true) },
  ];

  return (
    <Card size="small" title="Overview">
      <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} items={items} />
    </Card>
  );
}
