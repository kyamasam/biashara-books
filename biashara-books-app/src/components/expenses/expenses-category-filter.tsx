import { StyleSheet, View } from 'react-native';

import { Pill } from '@/components/ui/pill';

import type { ExpenseCategoryFilter } from './expenses-data';

type ExpensesCategoryFilterProps = {
  filters: ExpenseCategoryFilter[];
  labels?: Map<ExpenseCategoryFilter, string>;
  selected: ExpenseCategoryFilter;
  onSelect: (category: ExpenseCategoryFilter) => void;
};

export function ExpensesCategoryFilter({
  filters,
  labels,
  selected,
  onSelect,
}: ExpensesCategoryFilterProps) {
  return (
    <View style={styles.container}>
      {filters.map((category) => {
        const isActive = category === selected;
        const label = labels?.get(category) ?? category;

        return (
          <Pill
            key={category}
            label={label}
            size="md"
            variant="outlined"
            color="default"
            selected={isActive}
            onPress={() => onSelect(category)}
            accessibilityLabel={`Filter by ${label}`}
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
