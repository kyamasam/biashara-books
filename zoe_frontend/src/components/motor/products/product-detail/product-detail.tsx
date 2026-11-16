"use client";

import { Space } from "antd";
import type { MotorInsuranceProduct } from "@/types/motor";
import { ExtraChargesTable } from "./extra-charges-table";
import { ProductBenefitsTable } from "./product-benefits-table";
import { ProductDetailHeader } from "./product-detail-header";
import { ProductOverviewCard } from "./product-overview-card";
import { ProductPricingCard } from "./product-pricing-card";

interface Props {
  product: MotorInsuranceProduct;
  onEdit: () => void;
  onEditPricing: () => void;
}

/** Read-only view of every section of a motor insurance product. */
export function ProductDetail({ product, onEdit, onEditPricing }: Props) {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <ProductDetailHeader product={product} onEdit={onEdit} />
      <ProductOverviewCard product={product} />
      <ProductPricingCard product={product} onEdit={onEditPricing} />
      <ProductBenefitsTable benefits={product.product_benefits ?? []} />
      <ExtraChargesTable charges={product.extra_charges ?? []} />
    </Space>
  );
}
