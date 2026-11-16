import { create } from "zustand";
import { axiosInstance } from "@/hooks/use-api";
import type { Paginated } from "@/types/common";
import type {
  CreatePricingRulePayload,
  MotorPricingRule,
  PricingRuleListParams,
  UpdatePricingRulePayload,
} from "@/types/motor";

interface MutationOptions {
  refetch?: boolean;
}

interface PricingRulesState {
  pricingRules: Paginated<MotorPricingRule> | null;
  selectedPricingRule: MotorPricingRule | null;
  params: PricingRuleListParams;

  isLoadingPricingRules: boolean;
  isLoadingPricingRule: boolean;
  isMutating: boolean;

  setParams: (params: PricingRuleListParams) => void;
  fetchPricingRules: (params?: PricingRuleListParams) => Promise<void>;
  fetchPricingRule: (id: string) => Promise<void>;
  /** `refetch` (default true) reloads the list afterwards; pass false for bulk edits. */
  createPricingRule: (
    payload: CreatePricingRulePayload,
    options?: MutationOptions
  ) => Promise<MotorPricingRule>;
  updatePricingRule: (
    id: string,
    payload: UpdatePricingRulePayload
  ) => Promise<MotorPricingRule>;
  deletePricingRule: (id: string, options?: MutationOptions) => Promise<void>;
  clearSelectedPricingRule: () => void;
}

export const usePricingRulesStore = create<PricingRulesState>((set, get) => ({
  pricingRules: null,
  selectedPricingRule: null,
  params: { page: 1 },

  isLoadingPricingRules: false,
  isLoadingPricingRule: false,
  isMutating: false,

  setParams: (params) => set((state) => ({ params: { ...state.params, ...params } })),

  fetchPricingRules: async (params) => {
    const merged = { ...get().params, ...params };
    set({ params: merged, isLoadingPricingRules: true });
    try {
      const { data } = await axiosInstance.get<Paginated<MotorPricingRule>>(
        "/motor/pricing-rules/",
        {
          params: {
            page: merged.page,
            motor_insurance_product: merged.motor_insurance_product || undefined,
            rate_calculation_method: merged.rate_calculation_method || undefined,
            is_active: merged.is_active ?? undefined,
            ordering: merged.ordering || undefined,
          },
        }
      );
      set({ pricingRules: data });
    } finally {
      set({ isLoadingPricingRules: false });
    }
  },

  fetchPricingRule: async (id) => {
    set({ isLoadingPricingRule: true });
    try {
      const { data } = await axiosInstance.get<MotorPricingRule>(`/motor/pricing-rules/${id}/`);
      set({ selectedPricingRule: data });
    } finally {
      set({ isLoadingPricingRule: false });
    }
  },

  createPricingRule: async (payload, { refetch = true } = {}) => {
    set({ isMutating: true });
    try {
      const { data } = await axiosInstance.post<MotorPricingRule>(
        "/motor/pricing-rules/",
        payload
      );
      if (refetch) await get().fetchPricingRules();
      return data;
    } finally {
      set({ isMutating: false });
    }
  },

  updatePricingRule: async (id, payload) => {
    set({ isMutating: true });
    try {
      const { data } = await axiosInstance.patch<MotorPricingRule>(
        `/motor/pricing-rules/${id}/`,
        payload
      );
      set((state) => ({
        selectedPricingRule: data,
        pricingRules: state.pricingRules
          ? {
              ...state.pricingRules,
              results: state.pricingRules.results.map((r) => (r.id === data.id ? data : r)),
            }
          : state.pricingRules,
      }));
      return data;
    } finally {
      set({ isMutating: false });
    }
  },

  deletePricingRule: async (id, { refetch = true } = {}) => {
    set({ isMutating: true });
    try {
      await axiosInstance.delete(`/motor/pricing-rules/${id}/`);
      set((state) =>
        state.selectedPricingRule?.id === id ? { selectedPricingRule: null } : {}
      );
      if (refetch) await get().fetchPricingRules();
    } finally {
      set({ isMutating: false });
    }
  },

  clearSelectedPricingRule: () => set({ selectedPricingRule: null }),
}));
