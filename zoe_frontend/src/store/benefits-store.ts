import { create } from "zustand";
import { axiosInstance } from "@/hooks/use-api";
import type { Paginated } from "@/types/common";
import type {
  Benefit,
  BenefitListParams,
  CreateBenefitPayload,
  UpdateBenefitPayload,
} from "@/types/motor";

interface BenefitsState {
  benefits: Paginated<Benefit> | null;
  selectedBenefit: Benefit | null;
  params: BenefitListParams;

  isLoadingBenefits: boolean;
  isLoadingBenefit: boolean;
  isMutating: boolean;

  setParams: (params: BenefitListParams) => void;
  fetchBenefits: (params?: BenefitListParams) => Promise<void>;
  fetchBenefit: (id: string) => Promise<void>;
  createBenefit: (payload: CreateBenefitPayload) => Promise<Benefit>;
  updateBenefit: (id: string, payload: UpdateBenefitPayload) => Promise<Benefit>;
  /** Soft delete: the backend sets `is_active = false`. */
  deleteBenefit: (id: string) => Promise<void>;
  clearSelectedBenefit: () => void;
}

export const useBenefitsStore = create<BenefitsState>((set, get) => ({
  benefits: null,
  selectedBenefit: null,
  params: { page: 1, search: "" },

  isLoadingBenefits: false,
  isLoadingBenefit: false,
  isMutating: false,

  setParams: (params) => set((state) => ({ params: { ...state.params, ...params } })),

  fetchBenefits: async (params) => {
    const merged = { ...get().params, ...params };
    set({ params: merged, isLoadingBenefits: true });
    try {
      const { data } = await axiosInstance.get<Paginated<Benefit>>("/motor/benefits/", {
        params: {
          page: merged.page,
          search: merged.search || undefined,
          is_active: merged.is_active ?? undefined,
        },
      });
      set({ benefits: data });
    } finally {
      set({ isLoadingBenefits: false });
    }
  },

  fetchBenefit: async (id) => {
    set({ isLoadingBenefit: true });
    try {
      const { data } = await axiosInstance.get<Benefit>(`/motor/benefits/${id}/`);
      set({ selectedBenefit: data });
    } finally {
      set({ isLoadingBenefit: false });
    }
  },

  createBenefit: async (payload) => {
    set({ isMutating: true });
    try {
      const { data } = await axiosInstance.post<Benefit>("/motor/benefits/", payload);
      await get().fetchBenefits();
      return data;
    } finally {
      set({ isMutating: false });
    }
  },

  updateBenefit: async (id, payload) => {
    set({ isMutating: true });
    try {
      const { data } = await axiosInstance.patch<Benefit>(`/motor/benefits/${id}/`, payload);
      set((state) => ({
        selectedBenefit: data,
        benefits: state.benefits
          ? {
              ...state.benefits,
              results: state.benefits.results.map((b) => (b.id === data.id ? data : b)),
            }
          : state.benefits,
      }));
      return data;
    } finally {
      set({ isMutating: false });
    }
  },

  deleteBenefit: async (id) => {
    set({ isMutating: true });
    try {
      await axiosInstance.delete(`/motor/benefits/${id}/`);
      set((state) =>
        state.selectedBenefit?.id === id
          ? { selectedBenefit: { ...state.selectedBenefit, is_active: false } }
          : {}
      );
      await get().fetchBenefits();
    } finally {
      set({ isMutating: false });
    }
  },

  clearSelectedBenefit: () => set({ selectedBenefit: null }),
}));
