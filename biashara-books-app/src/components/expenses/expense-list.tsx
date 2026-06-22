import { Plus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';


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
        {groups.map((group) => (
          <ExpenseGroupSection key={group.date} group={group} />
        ))}
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
});
