import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExpenseList } from '@/components/expenses/expense-list';
import { ExpensesCategoryFilter } from '@/components/expenses/expenses-category-filter';
import {
  EXPENSE_GROUPS,
  EXPENSE_MONTHS,
  EXPENSE_SUMMARY,
  type ExpenseCategoryFilter,
  type ExpenseGroup,
} from '@/components/expenses/expenses-data';
import { ExpensesPageHeader } from '@/components/expenses/expenses-page-header';
import { ExpensesSectionHeader } from '@/components/expenses/expenses-section-header';
import { ExpensesSummaryCard } from '@/components/expenses/expenses-summary-card';
import { PeriodSelection } from '@/components/ui/month-dropdown';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function ExpensesScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodSelection>(EXPENSE_MONTHS[5]);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryFilter>('All');

  const filteredGroups: ExpenseGroup[] = EXPENSE_GROUPS.map((group) => ({
    ...group,
    items:
      selectedCategory === 'All'
        ? group.items
        : group.items.filter((item) => item.category === selectedCategory),
  })).filter((group) => group.items.length > 0);

  const handleNewExpense = () => {
    // navigate to new expense form
  };

  const handleSearchPress = () => {
    // open search
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
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

        <ExpensesSummaryCard summary={EXPENSE_SUMMARY} />

        <ExpensesCategoryFilter
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <ExpenseList groups={filteredGroups} onNewExpense={handleNewExpense} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
