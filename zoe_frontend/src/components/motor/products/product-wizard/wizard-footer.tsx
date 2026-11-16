"use client";

import { Button, Flex, Space, Typography } from "antd";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { STEPS } from "./constants";
import type { WizardMode } from "./types";

const { Text } = Typography;

interface Props {
  current: number;
  isLastStep: boolean;
  isSaving: boolean;
  mode: WizardMode;
  onCancel: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function WizardFooter({
  current,
  isLastStep,
  isSaving,
  mode,
  onCancel,
  onPrev,
  onNext,
  onSubmit,
}: Props) {
  return (
    <Flex align="center" justify="space-between" gap={8} wrap>
      <Text type="secondary">
        Step {current + 1} of {STEPS.length}
      </Text>
      <Space>
        <Button onClick={onCancel}>Cancel</Button>
        {current > 0 && (
          <Button icon={<ArrowLeft className="h-4 w-4" />} onClick={onPrev}>
            Previous
          </Button>
        )}
        {isLastStep ? (
          <Button type="primary" loading={isSaving} onClick={onSubmit}>
            {mode === "edit" ? "Save changes" : "Create product"}
          </Button>
        ) : (
          <Button type="primary" onClick={onNext} icon={<ArrowRight className="h-4 w-4" />} iconPosition="end">
            Next
          </Button>
        )}
      </Space>
    </Flex>
  );
}
