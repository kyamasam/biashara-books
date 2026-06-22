export type ExpenseCategory = 'Rent' | 'Stock' | 'Utilities' | 'Salaries';

export type ExpenseCategoryFilter = 'All' | ExpenseCategory;

export type Expense = {
  id: string;
  vendor: string;
  category: ExpenseCategory;
  categoryLabel: string;
  amount: number;
  time: string;
};

export type ExpenseGroup = {
  label: string;
  date: string;
  total: number;
  items: Expense[];
};

export type MonthOption = {
  label: string;
  value: string;
  type: 'month';
};

export type ExpenseSummary = {
  month: string;
  totalSpent: number;
  pointsEarned: number;
};

export const EXPENSE_MONTHS: MonthOption[] = [
  { type: 'month', label: 'January', value: '2026-01' },
  { type: 'month', label: 'February', value: '2026-02' },
  { type: 'month', label: 'March', value: '2026-03' },
  { type: 'month', label: 'April', value: '2026-04' },
  { type: 'month', label: 'May', value: '2026-05' },
  { type: 'month', label: 'June', value: '2026-06' },
];

export const EXPENSE_CATEGORY_FILTERS: ExpenseCategoryFilter[] = [
  'All',
  'Rent',
  'Stock',
  'Utilities',
  'Salaries',
];

export const EXPENSE_SUMMARY: ExpenseSummary = {
  month: 'June',
  totalSpent: 47000,
  pointsEarned: 4000,
};

export const EXPENSE_GROUPS: ExpenseGroup[] = [
  {
    label: 'Today',
    date: '2026-06-19',
    total: 16000,
    items: [
      {
        id: 'exp-1',
        vendor: 'Sam West Distributors',
        category: 'Stock',
        categoryLabel: 'Stock/Inventory',
        amount: 12000,
        time: '5:13 PM',
      },
      {
        id: 'exp-2',
        vendor: 'KPLC',
        category: 'Utilities',
        categoryLabel: 'Utilities',
        amount: 4000,
        time: '5:13 PM',
      },
    ],
  },
  {
    label: 'Yesterday',
    date: '2026-06-18',
    total: 24000,
    items: [
      {
        id: 'exp-3',
        vendor: 'Sam West Distributors',
        category: 'Stock',
        categoryLabel: 'Stock/Inventory',
        amount: 12000,
        time: '5:13 PM',
      },
      {
        id: 'exp-4',
        vendor: 'Sam West Distributors',
        category: 'Stock',
        categoryLabel: 'Stock/Inventory',
        amount: 12000,
        time: '5:13 PM',
      },
    ],
  },
];

export function formatExpenseAmount(amount: number): string {
  return `-KES ${amount.toLocaleString('en-KE')}`;
}

export function formatGroupTotal(total: number): string {
  return `KES ${total.toLocaleString('en-KE')}`;
}
