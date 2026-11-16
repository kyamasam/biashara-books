"use client";

import { useEffect } from "react";
import { Button, Flex, Form, Input, Modal, Spin } from "antd";
import type { MotorInsuranceProduct } from "@/types/motor";
import { PricingStep } from "../../product-wizard/steps/pricing-step";
import { usePricingEdit } from "./use-pricing-edit";

interface Props {
  open: boolean;
  product: MotorInsuranceProduct;
  /** True while the product is being refetched; the form mounts only once fresh data arrives. */
  loading?: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

/** Edits only the product's pricing fields and pricing bands. */
export function PricingEditModal({ open, product, loading = false, onClose, onSaved }: Props) {
  const pricing = usePricingEdit({
    product,
    onSuccess: () => {
      onSaved?.();
      onClose();
    },
  });
  const { reset } = pricing;

  // Once the refetched product has arrived and the Form has mounted, reset the form to the fresh
  // initialValues — antd's form store otherwise keeps stale values over new initialValues.
  useEffect(() => {
    if (open && !loading) reset();
  }, [open, loading, reset]);

  const handleCancel = () => {
    // The form isn't mounted while loading; resetting it then would only trigger an antd warning.
    if (!loading) reset();
    onClose();
  };

  const footer = (
    <Flex gap={8} justify="flex-end">
      <Button onClick={handleCancel} disabled={pricing.isSaving}>
        Cancel
      </Button>
      <Button
        type="primary"
        loading={pricing.isSaving}
        disabled={loading}
        onClick={pricing.submit}
      >
        Save
      </Button>
    </Flex>
  );

  return (
    <Modal
      open={open}
      title="Edit pricing"
      width={880}
      centered
      destroyOnHidden
      maskClosable={false}
      onCancel={handleCancel}
      footer={footer}
    >
      {loading ? (
        <Flex justify="center" style={{ padding: "48px 0" }}>
          <Spin />
        </Flex>
      ) : (
        <Form
          form={pricing.form}
          layout="vertical"
          requiredMark={false}
          initialValues={pricing.initialValues}
        >
          {/* Registers band_type so PricingRulesList's useWatch can read it; never saved here. */}
          <Form.Item name="band_type" hidden noStyle>
            <Input />
          </Form.Item>
          <PricingStep />
        </Form>
      )}
    </Modal>
  );
}
