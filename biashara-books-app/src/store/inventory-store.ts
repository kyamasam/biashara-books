import { create } from 'zustand';

import { authGet } from '@/lib/api';
import type { ProductInventoryResponse } from '@/types/product';

type InventoryState = {
  items: ProductInventoryResponse[];
  isLoading: boolean;
  error: string | null;
  fetchInventory: (token: string) => Promise<void>;
  clearInventory: () => void;
};

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetchInventory: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authGet<{ data: ProductInventoryResponse[] }>('/api/inventory', token);
      set({ items: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Could not load inventory.', isLoading: false });
    }
  },
  clearInventory: () => set({ items: [], error: null, isLoading: false }),
}));
