"use client";

import { Form, Modal } from "antd";
import type { MotorInsuranceProduct } from "@/types/motor";
import { STEPS } from "./constants";
import { useProductWizard } from "./use-product-wizard";
import { WizardFooter } from "./wizard-footer";
import { WizardStepsHeader } from "./wizard-steps-header";
import { BasicsStep } from "./steps/basics-step";
import { PricingStep } from "./steps/pricing-step";
import { BenefitsStep } from "./steps/benefits-step";
import { LeviesReviewStep } from "./steps/levies-review-step";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved?: (product: MotorInsuranceProduct) => void;
  /** Edit provision (not wired yet): pre-fills the wizard and saves via `updateProduct`. */
  product?: MotorInsuranceProduct | null;
}

export function ProductWizardModal({ open, onClose, onSaved, product }: Props) {
  const wizard = useProductWizard({
    product,
    onSuccess: (saved) => {
      onSaved?.(saved);
      onClose();
    },
  });

  const handleCancel = () => {
    wizard.reset();
    onClose();
  };

  const panes = [
    <BasicsStep key="basics" />,
    <PricingStep key="pricing" />,
    <BenefitsStep key="benefits" />,
    <LeviesReviewStep key="levies" onEditStep={wizard.goTo} />,
  ];

  return (
    <Modal
      open={open}
      title={wizard.mode === "edit" ? "Edit motor product" : "New motor product"}
      width={880}
      centered
      destroyOnHidden
      maskClosable={false}
      onCancel={handleCancel}
      footer={
        <WizardFooter
          current={wizard.current}
          isLastStep={wizard.isLastStep}
          isSaving={wizard.isSaving}
          mode={wizard.mode}
          onCancel={handleCancel}
          onPrev={wizard.prev}
          onNext={wizard.next}
          onSubmit={wizard.submit}
        />
      }
    >
      <WizardStepsHeader current={wizard.current} onChange={wizard.goTo} />
      <Form
        form={wizard.form}
        layout="vertical"
        requiredMark={false}
        initialValues={wizard.initialValues}
      >
        {STEPS.map((step, i) => (
          <div key={step.key} style={{ display: i === wizard.current ? "block" : "none" }}>
            {panes[i]}
          </div>
        ))}
      </Form>
    </Modal>
  );
}
