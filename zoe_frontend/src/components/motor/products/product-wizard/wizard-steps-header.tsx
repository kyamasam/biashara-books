"use client";

import { Steps } from "antd";
import { STEPS } from "./constants";

interface Props {
  current: number;
  onChange: (step: number) => void;
}

export function WizardStepsHeader({ current, onChange }: Props) {
  return (
    <Steps
      size="small"
      current={current}
      onChange={onChange}
      items={STEPS.map((step, i) => ({ title: step.title, disabled: i > current }))}
      style={{ marginBottom: 24 }}
    />
  );
}
