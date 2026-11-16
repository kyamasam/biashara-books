import { create } from "zustand";
import { axiosInstance } from "@/hooks/use-api";
import type { Paginated } from "@/types/common";
import type {
  InsuranceProvider,
  InsuranceProviderListParams,
  InsuranceProviderPayload,
} from "@/types/insurance";

/** Multipart when a logo File is present, otherwise a plain JSON object. */
const toRequestBody = (
  payload: Partial<InsuranceProviderPayload>
): FormData | Partial<InsuranceProviderPayload> => {
  if (!(payload.logo instanceof File)) return payload;

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value === null) formData.append(key, "");
    else if (value instanceof File) formData.append(key, value);
    else formData.append(key, String(value));
  });
  return formData;
};

interface InsuranceProvidersState {
  providers: Paginated<InsuranceProvider> | null;
  selectedProvider: InsuranceProvider | null;

  isLoading: boolean;
  isLoadingDetail: boolean;
  isMutating: boolean;

  fetchProviders: (params?: InsuranceProviderListParams) => Promise<void>;
  fetchProvider: (id: number) => Promise<void>;
  createProvider: (payload: InsuranceProviderPayload) => Promise<InsuranceProvider>;
  updateProvider: (id: number, payload: InsuranceProviderPayload) => Promise<InsuranceProvider>;
  partialUpdateProvider: (
    id: number,
    payload: Partial<InsuranceProviderPayload>
  ) => Promise<InsuranceProvider>;
  deleteProvider: (id: number) => Promise<void>;
}

export const useInsuranceProvidersStore = create<InsuranceProvidersState>((set) => ({
  providers: null,
  selectedProvider: null,

  isLoading: false,
  isLoadingDetail: false,
  isMutating: false,

  fetchProviders: async (params) => {
    set({ isLoading: true });
    try {
      const { data } = await axiosInstance.get<Paginated<InsuranceProvider>>(
        "/insurance-providers/",
        { params }
      );
      set({ providers: data });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProvider: async (id) => {
    set({ isLoadingDetail: true });
    try {
      const { data } = await axiosInstance.get<InsuranceProvider>(`/insurance-providers/${id}/`);
      set({ selectedProvider: data });
    } finally {
      set({ isLoadingDetail: false });
    }
  },

  createProvider: async (payload) => {
    set({ isMutating: true });
    try {
      const { data } = await axiosInstance.post<InsuranceProvider>(
        "/insurance-providers/",
        toRequestBody(payload)
      );
      return data;
    } finally {
      set({ isMutating: false });
    }
  },

  updateProvider: async (id, payload) => {
    set({ isMutating: true });
    try {
      const { data } = await axiosInstance.put<InsuranceProvider>(
        `/insurance-providers/${id}/`,
        toRequestBody(payload)
      );
      set((state) =>
        state.selectedProvider?.id === id ? { selectedProvider: data } : {}
      );
      return data;
    } finally {
      set({ isMutating: false });
    }
  },

  partialUpdateProvider: async (id, payload) => {
    set({ isMutating: true });
    try {
      const { data } = await axiosInstance.patch<InsuranceProvider>(
        `/insurance-providers/${id}/`,
        toRequestBody(payload)
      );
      set((state) =>
        state.selectedProvider?.id === id ? { selectedProvider: data } : {}
      );
      return data;
    } finally {
      set({ isMutating: false });
    }
  },

  deleteProvider: async (id) => {
    set({ isMutating: true });
    try {
      await axiosInstance.delete(`/insurance-providers/${id}/`);
      set((state) =>
        state.selectedProvider?.id === id ? { selectedProvider: null } : {}
      );
    } finally {
      set({ isMutating: false });
    }
  },
}));
