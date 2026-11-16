"use client";

import { Divider } from "antd";
import { SectionTitle } from "../fields/section-title";
import { InstallmentFields } from "../pricing/installment-fields";
import { PremiumFields } from "../pricing/premium-fields";
import { PricingRulesList } from "../pricing/pricing-rules-list";

export function PricingStep() {
  return (
    <>
      <SectionTitle title="Premium & installments" />
      <PremiumFields />
      <InstallmentFields />
      <Divider style={{ marginTop: 0 }} />
      <PricingRulesList />
    </>
  );
}
