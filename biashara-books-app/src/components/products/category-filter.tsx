import { Pencil, Plus } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { BrandColors } from '@/constants/theme';
import type { ProductCategory } from '@/types/product';

type Props = {
  categories: ProductCategory[];
  selected: string;
  onSelect: (name: string) => void;
  onPressAdd: () => void;
  onPressManage: () => void;
};

export function ProductCategoryFilter({ categories, selected, onSelect, onPressAdd, onPressManage }: Props) {
  const allActive = selected === 'All';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      <Pressable
        onPress={() => onSelect('All')}
        style={[styles.chip, allActive ? styles.chipActive : styles.chipInactive]}>
        <Text style={[styles.chipText, allActive ? styles.chipTextActive : styles.chipTextInactive]}>
          All
        </Text>
      </Pressable>

      {categories.map((category) => {
        const isActive = selected === category.name;
        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category.name)}
            style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}>
            <Text
              style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}
              numberOfLines={1}>
              {category.name}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        accessibilityLabel="Add category"
        accessibilityRole="button"
        onPress={onPressAdd}
        style={styles.iconBtn}>
        <Plus size={16} strokeWidth={2.6} color={BrandColors.primary} />
      </Pressable>

      <Pressable
        accessibilityLabel="Manage categories"
        accessibilityRole="button"
        onPress={onPressManage}
        style={styles.iconBtn}>
        <Pencil size={15} strokeWidth={2.4} color={BrandColors.primary} />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: BrandColors.primary,
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
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
