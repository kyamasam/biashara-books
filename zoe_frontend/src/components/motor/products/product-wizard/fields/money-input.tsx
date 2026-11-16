"use client";

import { InputNumber } from "antd";
import type { InputNumberProps } from "antd";
import { formatThousands, parseThousands } from "../format";

type Props = Omit<InputNumberProps, "formatter" | "parser" | "prefix">;

/** KES amount with thousands separators. */
export function MoneyInput({ style, ...props }: Props) {
  return (
    <InputNumber
      prefix="KES"
      min={0}
      precision={2}
      placeholder="0"
      formatter={formatThousands}
      parser={parseThousands}
      style={{ width: "100%", ...style }}
      {...props}
    />
  );
}
