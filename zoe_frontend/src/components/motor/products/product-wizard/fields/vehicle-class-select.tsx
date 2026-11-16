"use client";

import { useEffect, useMemo } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";
import { useVehiclesStore } from "@/store/vehicles-store";

type Props = Omit<SelectProps<string>, "options" | "loading" | "showSearch">;

/** Vehicle class picker. The store keeps only the first page's `.results`, filtered locally. */
export function VehicleClassSelect(props: Props) {
  const vehicleClasses = useVehiclesStore((s) => s.vehicleClasses);
  const isLoading = useVehiclesStore((s) => s.isLoadingClasses);
  const fetchVehicleClasses = useVehiclesStore((s) => s.fetchVehicleClasses);

  useEffect(() => {
    fetchVehicleClasses();
  }, [fetchVehicleClasses]);

  const options = useMemo(
    () => vehicleClasses.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` })),
    [vehicleClasses]
  );

  return (
    <Select<string>
      placeholder="Select vehicle class"
      style={{ width: "100%" }}
      {...props}
      showSearch
      loading={isLoading}
      options={options}
      optionFilterProp="label"
    />
  );
}
