import { StyleSheet, View } from 'react-native';

import { Pill } from '@/components/ui/pill';

import type { ExpenseCategoryFilter } from './expenses-data';
import { EXPENSE_CATEGORY_FILTERS } from './expenses-data';

type ExpensesCategoryFilterProps = {
  selected: ExpenseCategoryFilter;
  onSelect: (category: ExpenseCategoryFilter) => void;
};

export function ExpensesCategoryFilter({ selected, onSelect }: ExpensesCategoryFilterProps) {
  return (
    <View style={styles.container}>
      {EXPENSE_CATEGORY_FILTERS.map((category) => {
        const isActive = category === selected;

        return (
          <Pill
            key={category}
            label={category}
            size="md"
            variant="outlined"
            color="default"
            selected={isActive}
            onPress={() => onSelect(category)}
            accessibilityLabel={`Filter by ${category}`}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 4,
  },
});
