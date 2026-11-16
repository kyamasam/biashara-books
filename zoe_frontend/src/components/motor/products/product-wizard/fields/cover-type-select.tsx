"use client";

import { useEffect, useMemo } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { useCoverTypesStore } from "@/store/cover-types-store";
import { useDebouncedSearch } from "./use-debounced-search";

type Props = Omit<SelectProps<string>, "options" | "loading" | "showSearch">;

/** Cover type picker. Searches the server, so paginated catalogues stay reachable. */
export function CoverTypeSelect(props: Props) {
  const coverTypes = useCoverTypesStore((s) => s.coverTypes);
  const isLoading = useCoverTypesStore((s) => s.isLoadingCoverTypes);
  const fetchCoverTypes = useCoverTypesStore((s) => s.fetchCoverTypes);

  useEffect(() => {
    fetchCoverTypes({ page: 1, search: "" });
  }, [fetchCoverTypes]);

  const options = useMemo(
    () => coverTypes?.results.map((c) => ({ value: c.id, label: c.name })) ?? [],
    [coverTypes]
  );
  const search = useDebouncedSearch((q) => fetchCoverTypes({ page: 1, search: q }));

  return (
    <Select<string>
      placeholder="Select cover type"
      style={{ width: "100%" }}
      {...props}
      showSearch
      loading={isLoading}
      options={options}
      filterOption={false}
      onSearch={search}
    />
  );
}
