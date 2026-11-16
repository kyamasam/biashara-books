"use client";

import type { ReactNode } from "react";
import { Button, Card, Space } from "antd";

interface Props {
  title: string;
  /** When set, shows an "Edit" link that jumps back to that step. */
  onEdit?: () => void;
  children: ReactNode;
}

export function ReviewSection({ title, onEdit, children }: Props) {
  return (
    <Card
      size="small"
      title={title}
      extra={
        onEdit && (
          <Button type="link" size="small" onClick={onEdit}>
            Edit
          </Button>
        )
      }
    >
      <Space direction="vertical" size={6} style={{ width: "100%" }}>
        {children}
      </Space>
    </Card>
  );
}
