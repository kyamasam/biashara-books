import { create } from "zustand";
import { axiosInstance } from "@/hooks/use-api";
import type { Paginated } from "@/types/common";
import type {
  CreateQuotePayload,
  MotorInsuranceProduct,
  Quote,
} from "@/types/motor";

interface QuotesState {
  quotes: Paginated<Quote> | null;
  selectedQuote: Quote | null;
  products: MotorInsuranceProduct[];

  isLoadingQuotes: boolean;
  isLoadingQuote: boolean;
  isLoadingProducts: boolean;
  isMutating: boolean;

  fetchQuotes: (params?: Record<string, unknown>) => Promise<void>;
  fetchQuote: (id: string) => Promise<void>;
  fetchProducts: () => Promise<void>;
  createQuote: (payload: CreateQuotePayload) => Promise<Quote>;
  clearSelectedQuote: () => void;
}

export const useQuotesStore = create<QuotesState>((set) => ({
  quotes: null,
  selectedQuote: null,
  products: [],

  isLoadingQuotes: false,
  isLoadingQuote: false,
  isLoadingProducts: false,
  isMutating: false,

  fetchQuotes: async (params) => {
    set({ isLoadingQuotes: true });
    try {
      const { data } = await axiosInstance.get<Paginated<Quote>>("/motor/quotes/", { params });
      set({ quotes: data });
    } finally {
      set({ isLoadingQuotes: false });
    }
  },

  fetchQuote: async (id) => {
    set({ isLoadingQuote: true });
    try {
      const { data } = await axiosInstance.get<Quote>(`/motor/quotes/${id}/`);
      set({ selectedQuote: data });
    } finally {
      set({ isLoadingQuote: false });
    }
  },

  fetchProducts: async () => {
    set({ isLoadingProducts: true });
    try {
      const { data } = await axiosInstance.get<Paginated<MotorInsuranceProduct>>("/motor/products/");
      set({ products: data.results });
    } finally {
      set({ isLoadingProducts: false });
    }
  },

  createQuote: async (payload) => {
    set({ isMutating: true });
    try {
      const { data } = await axiosInstance.post<Quote>("/motor/quotes/", payload);
      return data;
    } finally {
      set({ isMutating: false });
    }
  },

  clearSelectedQuote: () => set({ selectedQuote: null }),
}));
