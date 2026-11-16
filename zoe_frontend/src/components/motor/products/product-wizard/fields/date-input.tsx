"use client";

import { DatePicker } from "antd";
import dayjs from "dayjs";

const ISO = "YYYY-MM-DD";

interface Props {
  /** ISO date (YYYY-MM-DD). */
  value?: string | null;
  onChange?: (value: string | null) => void;
  /** ISO date; earlier days are disabled. */
  minDate?: string | null;
  allowClear?: boolean;
  placeholder?: string;
}

/** DatePicker that reads and writes ISO date strings, so form values stay serialisable. */
export function DateInput({ value, onChange, minDate, allowClear = false, placeholder }: Props) {
  return (
    <DatePicker
      value={value ? dayjs(value, ISO) : null}
      onChange={(d) => onChange?.(d ? d.format(ISO) : null)}
      minDate={minDate ? dayjs(minDate, ISO) : undefined}
      allowClear={allowClear}
      placeholder={placeholder}
      format="DD MMM YYYY"
      style={{ width: "100%" }}
    />
  );
}
