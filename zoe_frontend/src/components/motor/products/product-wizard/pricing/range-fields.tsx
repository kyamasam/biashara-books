"use client";

import { Flex, Form, InputNumber, Typography } from "antd";
import type { InputNumberProps } from "antd";
import { formatThousands, parseThousands } from "../format";

const { Text } = Typography;

interface Props {
  /** Form.List name the row belongs to (for absolute cross-field lookups). */
  listName: string;
  /** Row index within the Form.List. */
  name: number;
  minKey: string;
  maxKey: string;
  label: string;
  prefix?: string;
  suffix?: string;
  precision?: number;
  /** Group thousands (for money values). */
  thousands?: boolean;
}

/** Min/max pair where max must be greater than or equal to min. */
export function RangeFields({
  listName,
  name,
  minKey,
  maxKey,
  label,
  prefix,
  suffix,
  precision = 0,
  thousands = false,
}: Props) {
  const inputProps: InputNumberProps = {
    min: 0,
    precision,
    prefix,
    suffix,
    style: { width: "100%" },
    ...(thousands ? { formatter: formatThousands, parser: parseThousands } : {}),
  };

  return (
    <Form.Item label={label} required>
      <Flex gap={8} align="center">
        <Form.Item
          name={[name, minKey]}
          noStyle
          rules={[{ required: true, message: `Enter the minimum ${label.toLowerCase()}` }]}
        >
          <InputNumber placeholder="Min" {...inputProps} />
        </Form.Item>
        <Text type="secondary">to</Text>
        <Form.Item
          name={[name, maxKey]}
          noStyle
          dependencies={[[listName, name, minKey]]}
          rules={[
            { required: true, message: `Enter the maximum ${label.toLowerCase()}` },
            ({ getFieldValue }) => ({
              validator(_, max?: number | null) {
                const min = getFieldValue([listName, name, minKey]) as number | null | undefined;
                if (max == null || min == null || max >= min) return Promise.resolve();
                return Promise.reject(new Error("Maximum must be greater than or equal to minimum"));
              },
            }),
          ]}
        >
          <InputNumber placeholder="Max" {...inputProps} />
        </Form.Item>
      </Flex>
    </Form.Item>
  );
}
