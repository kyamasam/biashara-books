import { create } from 'zustand';

export type CurrentSaleItem = {
  inventoryId: string;
  quantity: number;
  unitPrice: number;
};

export type CurrentSale = {
  items: CurrentSaleItem[];
  amountPaid: number;
  transactionId: string;
};

export type CheckoutItem = CurrentSaleItem & {
  productId: string;
  name: string;
  lineTotal: number;
};

type SaleState = {
  currentSale: CurrentSale;
  checkoutItems: CheckoutItem[];
  setCurrentSale: (items: CheckoutItem[]) => void;
  clearCurrentSale: () => void;
};

function createTransactionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function emptySale(): CurrentSale {
  return {
    items: [],
    amountPaid: 0,
    transactionId: createTransactionId(),
  };
}

export const useSaleStore = create<SaleState>((set) => ({
  currentSale: emptySale(),
  checkoutItems: [],
  setCurrentSale: (items) => {
    const amountPaid = items.reduce((sum, item) => sum + item.lineTotal, 0);

    set((state) => ({
      checkoutItems: items,
      currentSale: {
        items: items.map(({ inventoryId, quantity, unitPrice }) => ({
          inventoryId,
          quantity,
          unitPrice,
        })),
        amountPaid,
        transactionId: state.currentSale.transactionId || createTransactionId(),
      },
    }));
  },
  clearCurrentSale: () => set({ currentSale: emptySale(), checkoutItems: [] }),
}));
