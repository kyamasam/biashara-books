import { create } from "zustand";
import { axiosInstance } from "@/hooks/use-api";
import type { Paginated } from "@/types/common";
import type {
  CreateExtraChargePayload,
  ExtraChargeListParams,
  MotorExtraCharge,
  UpdateExtraChargePayload,
} from "@/types/motor";

interface ExtraChargesState {
  extraCharges: Paginated<MotorExtraCharge> | null;
  selectedExtraCharge: MotorExtraCharge | null;
  params: ExtraChargeListParams;

  isLoadingExtraCharges: boolean;
  isLoadingExtraCharge: boolean;
  isMutating: boolean;

  setParams: (params: ExtraChargeListParams) => void;
  fetchExtraCharges: (params?: ExtraChargeListParams) => Promise<void>;
  fetchExtraCharge: (id: string) => Promise<void>;
  createExtraCharge: (payload: CreateExtraChargePayload) => Promise<MotorExtraCharge>;
  updateExtraCharge: (
    id: string,
    payload: UpdateExtraChargePayload
  ) => Promise<MotorExtraCharge>;
  deleteExtraCharge: (id: string) => Promise<void>;
  clearSelectedExtraCharge: () => void;
}

export const useExtraChargesStore = create<ExtraChargesState>((set, get) => ({
  extraCharges: null,
  selectedExtraCharge: null,
  params: { page: 1 },

  isLoadingExtraCharges: false,
  isLoadingExtraCharge: false,
  isMutating: false,

  setParams: (params) => set((state) => ({ params: { ...state.params, ...params } })),

  fetchExtraCharges: async (params) => {
    const merged = { ...get().params, ...params };
    set({ params: merged, isLoadingExtraCharges: true });
    try {
      const { data } = await axiosInstance.get<Paginated<MotorExtraCharge>>(
        "/motor/extra-charges/",
        {
          params: {
            page: merged.page,
            motor_insurance_product: merged.motor_insurance_product || undefined,
            code: merged.code || undefined,
            method: merged.method || undefined,
            is_active: merged.is_active ?? undefined,
          },
        }
      );
      set({ extraCharges: data });
    } finally {
      set({ isLoadingExtraCharges: false });
    }
  },

  fetchExtraCharge: async (id) => {
    set({ isLoadingExtraCharge: true });
    try {
      const { data } = await axiosInstance.get<MotorExtraCharge>(`/motor/extra-charges/${id}/`);
      set({ selectedExtraCharge: data });
    } finally {
      set({ isLoadingExtraCharge: false });
    }
  },

  createExtraCharge: async (payload) => {
    set({ isMutating: true });
    try {
      const { data } = await axiosInstance.post<MotorExtraCharge>(
        "/motor/extra-charges/",
        payload
      );
      await get().fetchExtraCharges();
      return data;
    } finally {
      set({ isMutating: false });
    }
  },

  updateExtraCharge: async (id, payload) => {
    set({ isMutating: true });
    try {
      const { data } = await axiosInstance.patch<MotorExtraCharge>(
        `/motor/extra-charges/${id}/`,
        payload
      );
      set((state) => ({
        selectedExtraCharge: data,
        extraCharges: state.extraCharges
          ? {
              ...state.extraCharges,
              results: state.extraCharges.results.map((c) => (c.id === data.id ? data : c)),
            }
          : state.extraCharges,
      }));
      return data;
    } finally {
      set({ isMutating: false });
    }
  },

  deleteExtraCharge: async (id) => {
    set({ isMutating: true });
    try {
      await axiosInstance.delete(`/motor/extra-charges/${id}/`);
      set((state) =>
        state.selectedExtraCharge?.id === id ? { selectedExtraCharge: null } : {}
      );
      await get().fetchExtraCharges();
    } finally {
      set({ isMutating: false });
    }
  },

  clearSelectedExtraCharge: () => set({ selectedExtraCharge: null }),
}));
