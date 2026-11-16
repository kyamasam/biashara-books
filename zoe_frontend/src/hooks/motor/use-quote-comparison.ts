"use client";

import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useApi, useApiMutation } from "@/hooks/use-api";
import type { Paginated } from "@/types/common";
import type {
  Benefit,
  CoverType,
  InsuranceProvider,
  QuoteComparisonPayload,
  QuoteComparisonResponse,
  VehicleClass,
  VehicleMake,
  VehicleModel,
} from "@/types/motor";

/** Safety cap so a misbehaving `next` link can never loop forever. */
const MAX_PAGES = 20;
const LOOKUP_STALE_TIME = 5 * 60 * 1000;

/**
 * Fetches every page of a public, paginated catalogue list (PAGE_SIZE = 15)
 * without sending auth, so it works for logged-out visitors.
 */
function usePublicList<T>(
  url: string,
  params?: Record<string, unknown>,
  enabled = true,
) {
  const { request } = useApi();

  return useQuery<T[], AxiosError>({
    queryKey: ["public-list", url, params ?? {}],
    enabled,
    staleTime: LOOKUP_STALE_TIME,
    queryFn: async () => {
      const items: T[] = [];
      for (let page = 1; page <= MAX_PAGES; page += 1) {
        const data = await request<Paginated<T>>(
          url,
          "GET",
          undefined,
          { ...params, page },
          { skipAuth: true },
        );
        items.push(...data.results);
        if (!data.next) break;
      }
      return items;
    },
  });
}

export const usePublicVehicleClasses = () =>
  usePublicList<VehicleClass>("/motor/vehicle-classes/");

export const usePublicCoverTypes = () =>
  usePublicList<CoverType>("/motor/cover-types/");

export const usePublicVehicleMakes = () =>
  usePublicList<VehicleMake>("/motor/vehicle-makes/");

export const usePublicVehicleModels = (makeId?: string) =>
  usePublicList<VehicleModel>(
    "/motor/vehicle-models/",
    { vehicle_make: makeId },
    !!makeId,
  );

export const usePublicBenefits = () =>
  usePublicList<Benefit>("/motor/benefits/");

export const usePublicInsuranceProviders = () =>
  usePublicList<InsuranceProvider>("/insurance-providers/");

/**
 * Public, read-only price comparison. Silent: errors are shown inline by the
 * caller instead of the global toast (and a "created" toast makes no sense here).
 */
export const useQuoteComparison = () =>
  useApiMutation<QuoteComparisonResponse, QuoteComparisonPayload>({
    method: "POST",
    url: "/motor/quote-comparisons/",
    skipAuth: true,
    silent: true,
  });
