"use client";

import { SectionTitle } from "../fields/section-title";
import { BenefitsList } from "../benefits/benefits-list";

export function BenefitsStep() {
  return (
    <>
      <SectionTitle
        title="Benefits"
        description="Turn on the benefits this product offers, then set limits and charges."
      />
      <BenefitsList />
    </>
  );
}
