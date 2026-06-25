import { Plus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

import { AppButton } from '../ui/button';
import { ExpenseGroupSection } from './expense-group';
import type { ExpenseGroup } from './expenses-data';

type ExpenseListProps = {
  groups: ExpenseGroup[];
  onNewExpense: () => void;
};

export function ExpenseList({ groups, onNewExpense }: ExpenseListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.btnContainer}>
        <AppButton
          variant='primary'
          label="New Expense"
          icon={Plus}
          size='sm'
          iconPosition="right"
          onPress={onNewExpense}
        />
      </View>

      <View style={styles.groups}>
        {groups.length > 0 ? (
          groups.map((group) => (
            <ExpenseGroupSection key={group.date} group={group} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyTitle}>No expenses found</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.emptyText}>
              Add an expense or change the selected filters.
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  container: {
    gap: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  groups: {
    gap: 20,
  },
  emptyState: {
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9d9d9',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
