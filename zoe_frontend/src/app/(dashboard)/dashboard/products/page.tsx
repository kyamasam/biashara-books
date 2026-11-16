"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Flex, Input, Space, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Eye, Plus } from "lucide-react";
import { BaseTable } from "@/components";
import { ProductWizardModal } from "@/components/motor/products/product-wizard/product-wizard-modal";
import { BAND_TYPE_OPTIONS, labelOf } from "@/components/motor/products/product-wizard/constants";
import { formatMoney } from "@/components/motor/products/product-wizard/format";
import { useMotorProductsStore } from "@/store/motor-products-store";
import type { MotorInsuranceProduct } from "@/types/motor";

const { Title, Text } = Typography;
const { Search } = Input;

const PAGE_SIZE = 15;

const columns: ColumnsType<MotorInsuranceProduct> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (val: string, r) => (
      <Link href={`/dashboard/products/${r.id}`}>
        <Text strong style={{ color: "inherit" }}>
          {val}
        </Text>
      </Link>
    ),
  },
  { title: "Insurer", key: "insurer", render: (_, r) => r.insurer?.name ?? "—" },
  { title: "Vehicle class", key: "vehicle_class", render: (_, r) => r.vehicle_class?.name ?? "—" },
  { title: "Cover type", key: "cover_type", render: (_, r) => r.cover_type?.name ?? "—" },
  {
    title: "Band type",
    dataIndex: "band_type",
    key: "band_type",
    render: (val: MotorInsuranceProduct["band_type"]) => <Tag>{labelOf(BAND_TYPE_OPTIONS, val)}</Tag>,
  },
  {
    title: "Minimum premium",
    dataIndex: "minimum_premium",
    key: "minimum_premium",
    render: (val: string) => formatMoney(val),
  },
  {
    title: "Bands",
    key: "pricing_rules",
    width: 80,
    render: (_, r) => r.pricing_rules?.length ?? 0,
  },
  {
    title: "Status",
    dataIndex: "is_active",
    key: "is_active",
    width: 100,
    render: (val?: boolean) => (val === false ? <Tag>Inactive</Tag> : <Tag color="green">Active</Tag>),
  },
  {
    title: "Actions",
    key: "actions",
    width: 80,
    fixed: "right",
    render: (_, r) => (
      <Tooltip title="View">
        <Link href={`/dashboard/products/${r.id}`}>
          <Button type="text" size="small" aria-label={`View ${r.name}`} icon={<Eye className="h-4 w-4" />} />
        </Link>
      </Tooltip>
    ),
  },
];

export default function ProductsPage() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const products = useMotorProductsStore((s) => s.products);
  const params = useMotorProductsStore((s) => s.params);
  const isLoading = useMotorProductsStore((s) => s.isLoadingProducts);
  const fetchProducts = useMotorProductsStore((s) => s.fetchProducts);

  useEffect(() => {
    fetchProducts({ page: 1, search: "" });
  }, [fetchProducts]);

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <Flex justify="space-between" align="flex-start" wrap gap={12}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Products
          </Title>
          <Text type="secondary">Motor insurance products, their pricing bands and benefits.</Text>
        </div>
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setWizardOpen(true)}>
          New product
        </Button>
      </Flex>

      <Search
        placeholder="Search products…"
        allowClear
        onSearch={(search) => fetchProducts({ page: 1, search })}
        style={{ maxWidth: 420 }}
      />

      <BaseTable<MotorInsuranceProduct>
        rowKey="id"
        dataSource={products?.results}
        columns={columns}
        loading={isLoading}
        scroll={{ x: 900 }}
        pagination={{
          current: params.page ?? 1,
          pageSize: PAGE_SIZE,
          total: products?.count,
          showSizeChanger: false,
          onChange: (page) => fetchProducts({ page }),
        }}
      />

      <ProductWizardModal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSaved={() => fetchProducts({ page: 1 })}
      />
    </Space>
  );
}
