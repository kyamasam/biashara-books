"use client";

import { Divider } from "antd";
import { ExtraChargesList } from "../charges/extra-charges-list";
import { SectionTitle } from "../fields/section-title";
import { ProductReview } from "../review/product-review";

interface Props {
  onEditStep: (step: number) => void;
}

export function LeviesReviewStep({ onEditStep }: Props) {
  return (
    <>
      <ExtraChargesList />
      <Divider />
      <SectionTitle title="Review" description="Check everything before creating the product." />
      <ProductReview onEditStep={onEditStep} />
    </>
  );
}
