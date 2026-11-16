"use client";

import Link from "next/link";
import { Button, Card, Result, Skeleton, Space } from "antd";

interface Props {
  status: "loading" | "not-found" | "error";
  onRetry?: () => void;
}

/** Loading, not-found and error placeholders for the product detail page. */
export function ProductDetailState({ status, onRetry }: Props) {
  if (status === "loading") {
    return (
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Skeleton active title paragraph={{ rows: 1 }} />
        {[0, 1, 2].map((i) => (
          <Card key={i} size="small">
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        ))}
      </Space>
    );
  }

  const backButton = (
    <Link key="back" href="/dashboard/products">
      <Button>Back to products</Button>
    </Link>
  );

  if (status === "not-found") {
    return (
      <Result
        status="404"
        title="Product not found"
        subTitle="This product doesn't exist or is no longer available."
        extra={backButton}
      />
    );
  }

  return (
    <Result
      status="error"
      title="Couldn't load this product"
      subTitle="Something went wrong while fetching the product."
      extra={[
        <Button key="retry" type="primary" onClick={onRetry}>
          Retry
        </Button>,
        backButton,
      ]}
    />
  );
}
