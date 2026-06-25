import { create } from 'zustand';

import { authGet } from '@/lib/api';

export type Stats = {
  profit: number;
  sales: number;
  expenses: number;
  stock: number;
  stockValue: number;
  startDate: string | null;
  endDate: string | null;
};

type StatsState = {
  stats: Stats | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: (token: string, startDate: string, endDate: string) => Promise<void>;
  clearStats: () => void;
};

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  isLoading: false,
  error: null,
  fetchStats: async (token, startDate, endDate) => {
    set({ isLoading: true, error: null });

    try {
      const query = new URLSearchParams({ startDate, endDate });
      const response = await authGet<{ data: Stats }>(`/api/stats?${query.toString()}`, token);
      set({ stats: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Could not load stats.', isLoading: false });
    }
  },
  clearStats: () => set({ stats: null, error: null, isLoading: false }),
}));
