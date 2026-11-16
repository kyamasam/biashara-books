"use client";

import { InputNumber } from "antd";
import type { InputNumberProps } from "antd";
import { FIXED_AMOUNT } from "../constants";
import { MoneyInput } from "./money-input";

type Props = Omit<InputNumberProps, "formatter" | "parser" | "prefix" | "suffix"> & {
  /** Any method enum value; `FIXED_AMOUNT` switches to a KES amount, anything else is a percentage. */
  method?: string | null;
};

export function RateInput({ method, style, ...props }: Props) {
  if (method === FIXED_AMOUNT) return <MoneyInput style={style} {...props} />;

  return (
    <InputNumber
      suffix="%"
      min={0}
      max={100}
      step={0.01}
      precision={4}
      placeholder="0"
      style={{ width: "100%", ...style }}
      {...props}
    />
  );
}
