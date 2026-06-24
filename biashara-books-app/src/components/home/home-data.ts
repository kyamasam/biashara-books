import type { Href } from 'expo-router';

import type { AppIconName } from '@/components/ui/app-icon';

export type HomeAction = {
  label: string;
  color: string;
  icon: AppIconName;
  href: Href;
};

export type Transaction = {
  id: string;
  customer: string;
  purpose: string;
  date: string;
  amount: string;
  status: string;
  type: 'outgoing' | 'incoming';
};

export type TransactionGroup = {
  date: string;
  items: Transaction[];
};

export const HOME_ACTIONS: HomeAction[] = [
  { label: 'Pay', color: '#1677f2', icon: 'pay', href: '/expenses' },
  { label: 'Make Sale', color: '#16b9e8', icon: 'makeSale', href: '/sale' },
  { label: 'Books', color: '#2fc66f', icon: 'books', href: '/books' },
  { label: 'Loans', color: '#ff2d62', icon: 'loans', href: '/loans' },
];

