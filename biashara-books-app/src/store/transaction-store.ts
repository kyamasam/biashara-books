import { create } from 'zustand';

import type { Transaction, TransactionGroup } from '@/components/home/home-data';
import { authGet } from '@/lib/api';
import type { ApiTransaction, TransactionPage } from '@/types/transaction';

interface TransactionState {
  groups: TransactionGroup[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: (token: string) => Promise<void>;
  clearTransactions: () => void;
}

function mapStatus(status: string): string {
  switch (status) {
    case 'success':
      return 'Successful';
    case 'failed':
      return 'Failed';
    default:
      return 'Pending';
  }
}

function formatAmount(amount: number, type: 'credit' | 'debit'): string {
  const formatted = amount.toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return type === 'debit' ? `+ KES ${formatted}` : `- KES ${formatted}`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function groupKey(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function mapTransaction(t: ApiTransaction): Transaction {
  const customer = t.transactionType === 'debit' ? t.senderName : t.receiverName;
  return {
    id: t.id,
    customer,
    purpose: t.transactionPurposeDetail,
    date: formatDate(t.createdAt),
    amount: formatAmount(t.transactionAmount, t.transactionType),
    status: mapStatus(t.transactionStatus),
    type: t.transactionType === 'debit' ? 'incoming' : 'outgoing',
  };
}

function groupByDate(transactions: ApiTransaction[]): TransactionGroup[] {
  const map = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const key = groupKey(t.createdAt);
    const mapped = mapTransaction(t);
    const existing = map.get(key);
    if (existing) {
      existing.push(mapped);
    } else {
      map.set(key, [mapped]);
    }
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

export const useTransactionStore = create<TransactionState>((set) => ({
  groups: [],
  isLoading: false,
  error: null,
  fetchTransactions: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authGet<{ data: TransactionPage }>('/api/transactions?page=1&size=20', token);
      set({ groups: groupByDate(res.data.content), isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },
  clearTransactions: () => set({ groups: [], error: null }),
}));
