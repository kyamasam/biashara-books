"use client";

import type { ReactNode } from "react";
import { Flex, Typography } from "antd";

const { Text, Title } = Typography;

interface Props {
  title: string;
  description?: string;
  extra?: ReactNode;
}

export function SectionTitle({ title, description, extra }: Props) {
  return (
    <Flex align="flex-start" justify="space-between" gap={12} style={{ marginBottom: 12 }}>
      <div>
        <Title level={5} style={{ margin: 0 }}>
          {title}
        </Title>
        {description && <Text type="secondary">{description}</Text>}
      </div>
      {extra}
    </Flex>
  );
}
