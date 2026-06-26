import { type Href, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExpenseList } from '@/components/expenses/expense-list';
import { ExpensesCategoryFilter } from '@/components/expenses/expenses-category-filter';
import {
  EXPENSE_MONTHS,
  type ExpenseCategoryFilter,
  type ExpenseGroup,
  type Expense,
} from '@/components/expenses/expenses-data';
import { ExpensesPageHeader } from '@/components/expenses/expenses-page-header';
import { ExpensesSectionHeader } from '@/components/expenses/expenses-section-header';
import { ExpensesSummaryCard } from '@/components/expenses/expenses-summary-card';
import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { PeriodSelection } from '@/components/ui/month-dropdown';
import { BottomTabInset, BrandColors, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useTheme } from '@/hooks/use-theme';
import { authGet } from '@/lib/api';

type PaymentMethod = 'cash' | 'mpesa' | 'pochi' | 'till';

type ExpenseType = {
  id: string;
  name: string;
};

type ExpenseRecord = {
  id: string;
  expenseTypeId: string;
  otherName?: string | null;
  expenseAmount: number | string;
  paymentMethod?: PaymentMethod;
  expenseStatus?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const BOTTOM_APP_BAR_ITEMS: { label: string; icon: AppIconName; href: Href; isActive?: boolean }[] = [
  { label: 'Home', icon: 'home', href: '/' },
  { label: 'Pos', icon: 'pos', href: '/sale' },
  { label: 'Books', icon: 'books', href: '/books', isActive: true },
  { label: 'Loans', icon: 'loans', href: '/loans' },
];

function parseApiAmount(amount: number | string) {
  return typeof amount === 'number' ? amount : Number(amount) || 0;
}

function getExpenseDate(expense: ExpenseRecord) {
  return expense.createdAt || expense.updatedAt || new Date().toISOString();
}

function toDateKey(value: string) {
  return value.slice(0, 10);
}

function formatExpenseTime(value: string) {
  return new Date(value).toLocaleTimeString('en-KE', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatGroupLabel(dateKey: string) {
  const today = toDateKey(new Date().toISOString());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = toDateKey(yesterdayDate.toISOString());

  if (dateKey === today) return 'Today';
  if (dateKey === yesterday) return 'Yesterday';

  return new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getPeriodLabel(selection: PeriodSelection) {
  if (selection.type === 'month') return selection.label;

  return `${new Date(`${selection.startDate}T00:00:00`).toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
  })} - ${new Date(`${selection.endDate}T00:00:00`).toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
  })}`;
}

function isInSelectedPeriod(expense: Expense, selection: PeriodSelection) {
  if (selection.type === 'month') return expense.date.startsWith(selection.value);

  return expense.date >= selection.startDate && expense.date <= selection.endDate;
}

function groupExpenses(expenses: Expense[]): ExpenseGroup[] {
  const groups = new Map<string, Expense[]>();

  for (const expense of expenses) {
    const current = groups.get(expense.date) ?? [];
    current.push(expense);
    groups.set(expense.date, current);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      label: formatGroupLabel(date),
      date,
      total: items.reduce((sum, expense) => sum + expense.amount, 0),
      items: items.sort((a, b) => b.time.localeCompare(a.time)),
    }));
}

export default function ExpensesScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { accessToken } = useAuth();
  const { showError } = useToast();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodSelection>(EXPENSE_MONTHS[5]);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryFilter>('All');
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);

  const expenseTypeById = useMemo(
    () => new Map(expenseTypes.map((type) => [type.id, type.name])),
    [expenseTypes],
  );

  const mappedExpenses: Expense[] = useMemo(
    () =>
      expenses.map((expense) => {
        const expenseTypeName = expenseTypeById.get(expense.expenseTypeId) ?? 'Expense';
        const createdAt = getExpenseDate(expense);

        return {
          id: expense.id,
          vendor: expense.otherName?.trim() || expenseTypeName,
          category: expenseTypeName,
          expenseTypeId: expense.expenseTypeId,
          categoryLabel: expenseTypeName,
          amount: parseApiAmount(expense.expenseAmount),
          date: toDateKey(createdAt),
          time: formatExpenseTime(createdAt),
        };
      }),
    [expenses, expenseTypeById],
  );

  const activeCategory =
    selectedCategory === 'All' || expenseTypes.some((type) => type.id === selectedCategory)
      ? selectedCategory
      : 'All';

  const filteredExpenses = useMemo(
    () =>
      mappedExpenses.filter((expense) => {
        const matchesPeriod = isInSelectedPeriod(expense, selectedPeriod);
        const matchesType =
          activeCategory === 'All' || expense.expenseTypeId === activeCategory;

        return matchesPeriod && matchesType;
      }),
    [activeCategory, mappedExpenses, selectedPeriod],
  );

  const filteredGroups: ExpenseGroup[] = useMemo(
    () => groupExpenses(filteredExpenses),
    [filteredExpenses],
  );

  const filterOptions = useMemo<ExpenseCategoryFilter[]>(
    () => ['All', ...expenseTypes.map((type) => type.id)],
    [expenseTypes],
  );

  const filterLabels = useMemo(
    () => new Map<ExpenseCategoryFilter, string>([
      ['All', 'All'],
      ...expenseTypes.map((type) => [type.id, type.name] as [ExpenseCategoryFilter, string]),
    ]),
    [expenseTypes],
  );

  const expenseSummary = useMemo(
    () => ({
      month: getPeriodLabel(selectedPeriod),
      totalSpent: filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      pointsEarned: 0,
    }),
    [filteredExpenses, selectedPeriod],
  );

  useEffect(() => {
    if (!accessToken) return;

    let isMounted = true;
    const token = accessToken;

    async function loadInitialExpenses() {
      setIsLoadingExpenses(true);
      try {
        const [typesResponse, expensesResponse] = await Promise.all([
          authGet<{ data: ExpenseType[] }>('/api/expense-types', token),
          authGet<{ data: ExpenseRecord[] }>('/api/expenses', token),
        ]);

        if (!isMounted) return;
        setExpenseTypes(typesResponse.data);
        setExpenses(expensesResponse.data);
      } catch {
        if (!isMounted) return;
        showError('Could not load expenses.');
      } finally {
        if (!isMounted) return;
        setIsLoadingExpenses(false);
      }
    }

    void loadInitialExpenses();

    return () => {
      isMounted = false;
    };
  }, [accessToken, showError]);

  const handleNewExpense = () => {
    router.push('/expenses/new');
  };

  const handleSearchPress = () => {
    // open search
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: safeAreaInsets.top + Spacing.three,
            paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.four,
            paddingLeft: safeAreaInsets.left + Spacing.three,
            paddingRight: safeAreaInsets.right + Spacing.three,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <ExpensesPageHeader />

          <ExpensesSectionHeader
            months={EXPENSE_MONTHS}
            selected={selectedPeriod}
            onSelect={setSelectedPeriod}
            onSearchPress={handleSearchPress}
          />

          <ExpensesSummaryCard summary={expenseSummary} />

          <ExpensesCategoryFilter
            filters={filterOptions}
            labels={filterLabels}
            selected={activeCategory}
            onSelect={setSelectedCategory}
          />

          {isLoadingExpenses ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={BrandColors.primary} />
              <Text style={styles.loadingText}>Loading expenses...</Text>
            </View>
          ) : null}

          <ExpenseList groups={filteredGroups} onNewExpense={handleNewExpense} />
        </View>
      </ScrollView>

      <View style={[styles.bottomAppBar, { paddingBottom: safeAreaInsets.bottom }]}>
        {BOTTOM_APP_BAR_ITEMS.map((item) => (
          <Pressable
            key={item.label}
            accessibilityLabel={item.label}
            accessibilityRole="button"
            accessibilityState={{ selected: item.isActive }}
            onPress={() => router.replace(item.href)}
            style={({ pressed }) => [styles.bottomAppBarItem, pressed && styles.pressed]}>
            <AppIcon
              name={item.icon}
              size={20}
              color={item.isActive ? BrandColors.primary : '#9eaba2'}
              strokeWidth={2.2}
            />
            <Text
              style={[
                styles.bottomAppBarLabel,
                { color: item.isActive ? BrandColors.primary : '#9eaba2' },
              ]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
  },
  page: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  loadingState: {
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  loadingText: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  bottomAppBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 60,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -4 },
    elevation: 5,
  },
  bottomAppBarItem: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  bottomAppBarLabel: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.65,
  },
});
