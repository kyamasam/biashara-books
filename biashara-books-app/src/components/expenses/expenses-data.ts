export type ExpenseCategory = string;

export type ExpenseCategoryFilter = 'All' | ExpenseCategory;

export type Expense = {
  id: string;
  vendor: string;
  category: ExpenseCategory;
  expenseTypeId: string;
  categoryLabel: string;
  amount: number;
  date: string;
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
export type YearOption = {
  label: string;
  value: string;
  type: 'year';
};

export type ExpenseSummary = {
  month: string;
  totalSpent: number;
  pointsEarned: number;
};

export const EXPENSE_YEARS: YearOption[] = Array.from(
  { length: 2040 - 2010 + 1 },
  (_, i) => {
    const year = String(2010 + i);
    return { type: 'year', label: year, value: year };
  }
);
export const EXPENSE_MONTHS: MonthOption[] = [
  { type: 'month', label: 'January', value: '01' },
  { type: 'month', label: 'February', value: '02' },
  { type: 'month', label: 'March', value: '03' },
  { type: 'month', label: 'April', value: '04' },
  { type: 'month', label: 'May', value: '05' },
  { type: 'month', label: 'June', value: '06' },
  { type: 'month', label: 'July', value: '07' },
  { type: 'month', label: 'August', value: '08' },
  { type: 'month', label: 'September', value: '09' },
  { type: 'month', label: 'October', value: '10' },
  { type: 'month', label: 'November', value: '11' },
  { type: 'month', label: 'December', value: '12' },
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
        expenseTypeId: 'stock',
        categoryLabel: 'Stock/Inventory',
        amount: 12000,
        date: '2026-06-19',
        time: '5:13 PM',
      },
      {
        id: 'exp-2',
        vendor: 'KPLC',
        category: 'Utilities',
        expenseTypeId: 'utilities',
        categoryLabel: 'Utilities',
        amount: 4000,
        date: '2026-06-19',
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
        expenseTypeId: 'stock',
        categoryLabel: 'Stock/Inventory',
        amount: 12000,
        date: '2026-06-18',
        time: '5:13 PM',
      },
      {
        id: 'exp-4',
        vendor: 'Sam West Distributors',
        category: 'Stock',
        expenseTypeId: 'stock',
        categoryLabel: 'Stock/Inventory',
        amount: 12000,
        date: '2026-06-18',
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
