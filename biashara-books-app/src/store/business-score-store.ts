import { create } from 'zustand';

import { authGet } from '@/lib/api';

export type ScoreBreakdown = {
  sales: number;
  transactions: number;
  expenses: number;
  loans: number;
};

export type BusinessScore = {
  businessId: string;
  score: number;
  loanLimit: number;
  salesTotal: number;
  transactionsSum: number;
  expenses: number;
  otherLoansTotal: number;
  breakdown: ScoreBreakdown;
  periodMonths: number;
  periodStart: string;
  periodEnd: string;
};

type BusinessScoreState = {
  score: BusinessScore | null;
  isLoading: boolean;
  error: string | null;
  fetchScore: (token: string, months?: number) => Promise<void>;
  clearScore: () => void;
};

export const useBusinessScoreStore = create<BusinessScoreState>((set) => ({
  score: null,
  isLoading: false,
  error: null,
  fetchScore: async (token, months = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authGet<{ data: BusinessScore }>(
        `/api/business-score?months=${months}`,
        token,
      );
      set({ score: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Could not load business score.', isLoading: false });
    }
  },
  clearScore: () => set({ score: null, error: null, isLoading: false }),
}));
