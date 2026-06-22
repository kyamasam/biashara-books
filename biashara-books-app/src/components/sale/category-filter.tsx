import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { ProductCategory } from '@/types/product';

type FilterCategory = 'All' | ProductCategory;

const CATEGORIES: FilterCategory[] = ['All', 'Groceries', 'Drinks', 'Animal Products'];

type CategoryFilterProps = {
  selected: FilterCategory;
  onSelect: (category: FilterCategory) => void;
};

export { FilterCategory, CATEGORIES };

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {CATEGORIES.map((category) => {
        const isActive = selected === category;
        return (
          <TouchableOpacity
            key={category}
            onPress={() => onSelect(category)}
            activeOpacity={0.75}
            style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}>
            <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
              {category}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: '#1A6B52',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: '#374151',
  },
});
