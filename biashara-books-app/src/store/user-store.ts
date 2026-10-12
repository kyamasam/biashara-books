import { create } from 'zustand';
import { authGet, authPost } from '@/lib/api';
import type { UserProfile } from '@/types/user';

interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  isRefreshingBalance: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  isRefreshingBalance: false,
  error: null,
  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await authGet<{ data: UserProfile }>('/api/users/me');
      console.log('Current user API response:', res);
      set({ user: res.data, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },
  refreshBalance: async () => {
    set({ isRefreshingBalance: true, error: null });
    try {
      const res = await authPost<{ data: UserProfile['currentBusiness'] }>(
        '/api/businesses/current/refresh-balance',
        {},
      );
      set((state) => ({
        user: state.user
          ? {
              ...state.user,
              currentBusiness: res.data,
            }
          : state.user,
        isRefreshingBalance: false,
      }));
    } catch (e: any) {
      set({ error: e.message, isRefreshingBalance: false });
      throw e;
    }
  },
  clearUser: () => set({ user: null, error: null }),
}));
