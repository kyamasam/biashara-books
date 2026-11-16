"use client";

import type { ReactNode } from "react";
import { Flex, Typography } from "antd";

const { Text } = Typography;

interface Props {
  label: string;
  children: ReactNode;
}

export function ReviewRow({ label, children }: Props) {
  return (
    <Flex justify="space-between" gap={16}>
      <Text type="secondary">{label}</Text>
      <Text style={{ textAlign: "right" }}>{children}</Text>
    </Flex>
  );
}
