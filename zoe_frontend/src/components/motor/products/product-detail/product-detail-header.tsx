"use client";

import Link from "next/link";
import { Button, Flex, Space, Typography } from "antd";
import { ArrowLeft, Pencil } from "lucide-react";
import type { MotorInsuranceProduct } from "@/types/motor";
import { StatusTag } from "./status-tag";

const { Title, Text } = Typography;

interface Props {
  product: MotorInsuranceProduct;
  onEdit: () => void;
}

export function ProductDetailHeader({ product, onEdit }: Props) {
  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Link href="/dashboard/products">
        <Button type="link" icon={<ArrowLeft className="h-4 w-4" />} style={{ paddingInline: 0 }}>
          Back to products
        </Button>
      </Link>
      <Flex justify="space-between" align="flex-start" wrap gap={12}>
        <div>
          <Flex align="center" gap={8} wrap>
            <Title level={3} style={{ margin: 0 }}>
              {product.name}
            </Title>
            <StatusTag isActive={product.is_active} />
          </Flex>
          <Text type="secondary">
            {[product.insurer?.name, product.vehicle_class?.name, product.cover_type?.name]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </div>
        <Button type="primary" icon={<Pencil className="h-4 w-4" />} onClick={onEdit}>
          Edit
        </Button>
      </Flex>
    </Space>
  );
}
