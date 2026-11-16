"use client";

import { Tag } from "antd";

interface Props {
  isActive?: boolean;
}

export function StatusTag({ isActive }: Props) {
  return isActive === false ? <Tag>Inactive</Tag> : <Tag color="green">Active</Tag>;
}
