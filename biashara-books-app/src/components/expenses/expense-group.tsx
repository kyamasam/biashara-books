import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

import { ExpenseCard } from './expense-card';
import type { ExpenseGroup } from './expenses-data';
import { formatGroupTotal } from './expenses-data';

type ExpenseGroupProps = {
  group: ExpenseGroup;
};

export function ExpenseGroupSection({ group }: ExpenseGroupProps) {
  return (
    <View style={styles.group}>
      <View style={styles.groupHeader}>
        <ThemedText themeColor="textSecondary" style={styles.groupLabel}>
          {group.label}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.groupTotal}>
          {formatGroupTotal(group.total)}
        </ThemedText>
      </View>

      <View style={styles.cards}>
        {group.items.map((expense) => (
          <ExpenseCard key={expense.id} expense={expense} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupLabel: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
  groupTotal: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '400',
  },
  cards: {
    gap: 8,
  },
});
