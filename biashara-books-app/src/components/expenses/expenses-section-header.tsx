import { Search } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { MonthDropdown, type PeriodSelection } from '@/components/ui/month-dropdown';
import { Spacing } from '@/constants/theme';

import type { MonthOption } from './expenses-data';

type ExpensesSectionHeaderProps = {
  months: MonthOption[];
  selected: PeriodSelection;
  onSelect: (selection: PeriodSelection) => void;
  onSearchPress: () => void;
};

export function ExpensesSectionHeader({
  months,
  selected,
  onSelect,
  onSearchPress,
}: ExpensesSectionHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onSearchPress}
        accessibilityLabel="Search expenses"
        accessibilityRole="button"
        style={styles.searchBtn}
      >
        <Search size={20} color="#111111" strokeWidth={2.4} />
      </Pressable>

      <MonthDropdown  months={months} selected={selected} onSelect={onSelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  searchBtn: {
    padding: Spacing.two,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
 
  pressed: {
    borderWidth: 2,

    opacity: 0.7,
  },
});
