import { Building2, Package, ReceiptText, Users, Zap } from 'lucide-react-native';
import type { ComponentProps, ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

import type { Expense, ExpenseCategory } from './expenses-data';
import { formatExpenseAmount } from './expenses-data';

type LucideIcon = ComponentType<ComponentProps<typeof ReceiptText>>;

const CATEGORY_ICONS: Record<ExpenseCategory, LucideIcon> = {
  Rent: Building2,
  Stock: Package,
  Utilities: Zap,
  Salaries: Users,
};

type ExpenseCardProps = {
  expense: Expense;
};

export function ExpenseCard({ expense }: ExpenseCardProps) {
  const Icon = CATEGORY_ICONS[expense.category] ?? ReceiptText;

  return (
    <View style={styles.card}>
      <View style={styles.iconShell}>
        <Icon size={22} color="#000" strokeWidth={2.2} />
      </View>

      <View style={styles.body}>
        <ThemedText style={styles.vendor} numberOfLines={1}>
          {expense.vendor}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.category}>
          {expense.categoryLabel}
        </ThemedText>
      </View>

      <View style={styles.right}>
        <ThemedText style={styles.amount}>{formatExpenseAmount(expense.amount)}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.time}>
          {expense.time}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9d9d9',
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  iconShell: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  vendor: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },
  category: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '400',
  },
  right: {
    alignItems: 'flex-end',
    gap: 3,
  },
  amount: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },
  time: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '400',
  },
});
