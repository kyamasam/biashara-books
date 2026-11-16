"use client";

import { useEffect, useMemo } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { useInsuranceProvidersStore } from "@/store/insurance-providers-store";
import { useDebouncedSearch } from "./use-debounced-search";

type Props = Omit<SelectProps<number>, "options" | "loading" | "showSearch">;

/** Insurer picker. Searches the server, so paginated catalogues stay reachable. */
export function InsurerSelect(props: Props) {
  const providers = useInsuranceProvidersStore((s) => s.providers);
  const isLoading = useInsuranceProvidersStore((s) => s.isLoading);
  const fetchProviders = useInsuranceProvidersStore((s) => s.fetchProviders);

  useEffect(() => {
    fetchProviders({ page: 1 });
  }, [fetchProviders]);

  const options = useMemo(
    () => providers?.results.map((p) => ({ value: p.id, label: p.name })) ?? [],
    [providers]
  );
  const search = useDebouncedSearch((q) => fetchProviders({ page: 1, search: q || undefined }));

  return (
    <Select<number>
      placeholder="Select insurer"
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
