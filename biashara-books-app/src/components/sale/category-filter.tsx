import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { ProductCategory } from '@/types/product';

type FilterCategory = 'All' | string;

type CategoryFilterProps = {
  categories: ProductCategory[];
  selected: FilterCategory;
  onSelect: (category: FilterCategory) => void;
};

export { FilterCategory };

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  const filterCategories: FilterCategory[] = ['All', ...categories.map((c) => c.name).filter((n): n is string => Boolean(n))];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {filterCategories.map((category) => {
        const isActive = selected === category;
        return (
          <Pressable
            key={category}
            onPress={() => onSelect(category)}
            style={({ pressed }) => [
              styles.chip,
              isActive ? styles.chipActive : styles.chipInactive,
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
              {category}
            </Text>
          </Pressable>
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
  pressed: {
    opacity: 0.65,
  },
});
