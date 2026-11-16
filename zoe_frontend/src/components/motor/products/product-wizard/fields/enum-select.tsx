"use client";

import { Select } from "antd";
import type { SelectProps } from "antd";
import type { EnumOption } from "../constants";

type Props<T extends string> = Omit<SelectProps<T>, "options"> & {
  options: Array<EnumOption<T>>;
  /** Values shown but not selectable (e.g. already used elsewhere). */
  disabledValues?: T[];
};

export function EnumSelect<T extends string>({ options, disabledValues = [], ...props }: Props<T>) {
  return (
    <Select<T>
      style={{ width: "100%" }}
      {...props}
      options={options.map((o) => ({
        value: o.value,
        label: o.label,
        disabled: disabledValues.includes(o.value),
      }))}
    />
  );
}
