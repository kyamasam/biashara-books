"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ProductDetail } from "@/components/motor/products/product-detail/product-detail";
import { PricingEditModal } from "@/components/motor/products/product-detail/pricing-edit/pricing-edit-modal";
import { ProductDetailState } from "@/components/motor/products/product-detail/product-detail-state";
import { ProductWizardModal } from "@/components/motor/products/product-wizard/product-wizard-modal";
import { useApiQuery } from "@/hooks/use-api";
import type { MotorInsuranceProduct } from "@/types/motor";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [editOpen, setEditOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [isRefreshingPricing, setIsRefreshingPricing] = useState(false);

  const { data, isLoading, isError, error, refetch } = useApiQuery<MotorInsuranceProduct>(
    `/motor/products/${id}/`,
    { enabled: Boolean(id), retry: (count, err) => err.response?.status !== 404 && count < 2 }
  );

  const openPricingEdit = async () => {
    setPricingOpen(true);
    setIsRefreshingPricing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshingPricing(false);
    }
  };

  if (isLoading) return <ProductDetailState status="loading" />;
  if (isError || !data) {
    const notFound = !isError || error?.response?.status === 404;
    return <ProductDetailState status={notFound ? "not-found" : "error"} onRetry={() => refetch()} />;
  }

  return (
    <>
      <ProductDetail
        product={data}
        onEdit={() => setEditOpen(true)}
        onEditPricing={openPricingEdit}
      />
      <ProductWizardModal
        open={editOpen}
        product={data}
        onClose={() => setEditOpen(false)}
        onSaved={() => refetch()}
      />
      <PricingEditModal
        open={pricingOpen}
        product={data}
        loading={isRefreshingPricing}
        onClose={() => setPricingOpen(false)}
        onSaved={() => refetch()}
      />
    </>
  );
}
