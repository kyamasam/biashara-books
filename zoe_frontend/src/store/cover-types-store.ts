import { create } from "zustand";
import { axiosInstance } from "@/hooks/use-api";
import type { Paginated } from "@/types/common";
import type { CoverType, MotorCatalogueListParams } from "@/types/motor";

interface CoverTypesState {
  coverTypes: Paginated<CoverType> | null;
  selectedCoverType: CoverType | null;
  params: MotorCatalogueListParams;

  isLoadingCoverTypes: boolean;
  isLoadingCoverType: boolean;

  setParams: (params: MotorCatalogueListParams) => void;
  fetchCoverTypes: (params?: MotorCatalogueListParams) => Promise<void>;
  fetchCoverType: (id: string) => Promise<void>;
  clearSelectedCoverType: () => void;
}

export const useCoverTypesStore = create<CoverTypesState>((set, get) => ({
  coverTypes: null,
  selectedCoverType: null,
  params: { page: 1, search: "" },

  isLoadingCoverTypes: false,
  isLoadingCoverType: false,

  setParams: (params) => set((state) => ({ params: { ...state.params, ...params } })),

  fetchCoverTypes: async (params) => {
    const merged = { ...get().params, ...params };
    set({ params: merged, isLoadingCoverTypes: true });
    try {
      const { data } = await axiosInstance.get<Paginated<CoverType>>("/motor/cover-types/", {
        params: { page: merged.page, search: merged.search || undefined },
      });
      set({ coverTypes: data });
    } finally {
      set({ isLoadingCoverTypes: false });
    }
  },

  fetchCoverType: async (id) => {
    set({ isLoadingCoverType: true });
    try {
      const { data } = await axiosInstance.get<CoverType>(`/motor/cover-types/${id}/`);
      set({ selectedCoverType: data });
    } finally {
      set({ isLoadingCoverType: false });
    }
  },

  clearSelectedCoverType: () => set({ selectedCoverType: null }),
}));
