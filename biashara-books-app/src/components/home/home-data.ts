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

export const TRANSACTION_GROUPS: TransactionGroup[] = [
  {
    date: '3 June 2026',
    items: [
      {
        id: 'txn-1',
        customer: 'Victor Muasya',
        purpose: 'Loan repayment',
        date: '03 Jun 2026',
        amount: '- KES 1,000.00',
        status: 'Successful',
        type: 'outgoing',
      },
      {
        id: 'txn-2',
        customer: 'Samuel Muasya',
        purpose: 'Water bill purchase',
        date: '03 Jun 2026',
        amount: '- KES 2,000.00',
        status: 'Successful',
        type: 'outgoing',
      },
    ],
  },
  {
    date: '27 May 2026',
    items: [
      {
        id: 'txn-3',
        customer: 'Victor Muasya',
        purpose: 'Shop sale',
        date: '27 May 2026',
        amount: '- KES 1,000.00',
        status: 'Successful',
        type: 'incoming',
      },
      {
        id: 'txn-4',
        customer: 'Samuel Muasya',
        purpose: 'Stock purchase',
        date: '03 Jun 2026',
        amount: '- KES 2,000.00',
        status: 'Successful',
        type: 'outgoing',
      },
      {
        id: 'txn-5',
        customer: 'Anthony Kabaya',
        purpose: 'Customer payment',
        date: '27 May 2026',
        amount: '- KES 1,000.00',
        status: 'Successful',
        type: 'incoming',
      },
      {
        id: 'txn-6',
        customer: 'Samuel Muasya',
        purpose: 'Rent payment',
        date: '03 Jun 2026',
        amount: '- KES 2,000.00',
        status: 'Successful',
        type: 'outgoing',
      },
      {
        id: 'txn-7',
        customer: 'Anthony Kabaya',
        purpose: 'Loan repayment',
        date: '27 May 2026',
        amount: '- KES 1,000.00',
        status: 'Successful',
        type: 'incoming',
      },
    ],
  },
];
