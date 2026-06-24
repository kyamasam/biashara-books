import { create } from 'zustand';
import { authGet } from '@/lib/api';
import type { UserProfile } from '@/types/user';

interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: (token: string) => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  fetchUser: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authGet<{ data: UserProfile }>('/api/users/me', token);
      console.log('Current user API response:', res);
      set({ user: res.data, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },
  clearUser: () => set({ user: null, error: null }),
}));
