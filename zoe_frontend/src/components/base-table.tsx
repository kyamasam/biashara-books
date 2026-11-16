"use client";

import { Table } from "antd";
import type { TableProps } from "antd";

const DEFAULT_PAGINATION = {
  showSizeChanger: true,
  pageSizeOptions: ["10", "25", "50", "100"],
};

/** Project-wide antd Table wrapper with standard pagination defaults. */
export function BaseTable<T extends object>({
  pagination,
  ...props
}: TableProps<T>) {
  const mergedPagination =
    pagination === false ? false : { ...DEFAULT_PAGINATION, ...pagination };

  return <Table<T> pagination={mergedPagination} {...props} />;
}
