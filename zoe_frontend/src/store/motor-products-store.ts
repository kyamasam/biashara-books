import { create } from "zustand";
import { axiosInstance } from "@/hooks/use-api";
import type { Paginated } from "@/types/common";
import type {
  MotorInsuranceProduct,
  MotorProductListParams,
  MotorProductPayload,
  UpdateMotorProductPayload,
} from "@/types/motor";

interface MotorProductsState {
  products: Paginated<MotorInsuranceProduct> | null;
  selectedProduct: MotorInsuranceProduct | null;
  params: MotorProductListParams;

  isLoadingProducts: boolean;
  isLoadingProduct: boolean;
  isSavingProduct: boolean;

  setParams: (params: MotorProductListParams) => void;
  fetchProducts: (params?: MotorProductListParams) => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (payload: MotorProductPayload) => Promise<MotorInsuranceProduct>;
  updateProduct: (
    id: string,
    payload: UpdateMotorProductPayload
  ) => Promise<MotorInsuranceProduct>;
  clearSelectedProduct: () => void;
}

export const useMotorProductsStore = create<MotorProductsState>((set, get) => ({
  products: null,
  selectedProduct: null,
  params: { page: 1, search: "" },

  isLoadingProducts: false,
  isLoadingProduct: false,
  isSavingProduct: false,

  setParams: (params) => set((state) => ({ params: { ...state.params, ...params } })),

  fetchProducts: async (params) => {
    const merged = { ...get().params, ...params };
    set({ params: merged, isLoadingProducts: true });
    try {
      const { data } = await axiosInstance.get<Paginated<MotorInsuranceProduct>>(
        "/motor/products/",
        {
          params: {
            page: merged.page,
            search: merged.search || undefined,
            cover_type: merged.cover_type || undefined,
            insurer: merged.insurer ?? undefined,
            vehicle_class: merged.vehicle_class || undefined,
          },
        }
      );
      set({ products: data });
    } finally {
      set({ isLoadingProducts: false });
    }
  },

  fetchProduct: async (id) => {
    set({ isLoadingProduct: true });
    try {
      const { data } = await axiosInstance.get<MotorInsuranceProduct>(`/motor/products/${id}/`);
      set({ selectedProduct: data });
    } finally {
      set({ isLoadingProduct: false });
    }
  },

  createProduct: async (payload) => {
    set({ isSavingProduct: true });
    try {
      const { data } = await axiosInstance.post<MotorInsuranceProduct>("/motor/products/", payload);
      return data;
    } finally {
      set({ isSavingProduct: false });
    }
  },

  updateProduct: async (id, payload) => {
    set({ isSavingProduct: true });
    try {
      const { data } = await axiosInstance.patch<MotorInsuranceProduct>(
        `/motor/products/${id}/`,
        payload
      );
      set((state) => ({
        selectedProduct: data,
        products: state.products
          ? {
              ...state.products,
              results: state.products.results.map((p) => (p.id === data.id ? data : p)),
            }
          : state.products,
      }));
      return data;
    } finally {
      set({ isSavingProduct: false });
    }
  },

  clearSelectedProduct: () => set({ selectedProduct: null }),
}));
