import { Search } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { MonthDropdown, type PeriodSelection } from '@/components/ui/month-dropdown';
import { YearDropdown, type YearPeriodSelection } from '@/components/ui/year-dropdown';
import { Spacing } from '@/constants/theme';

import type { MonthOption, YearOption } from './expenses-data';

type ExpensesSectionHeaderProps = {
  months: MonthOption[];
  years: YearOption[];
  selected: PeriodSelection;
  selected_year: YearPeriodSelection;
  onSelectYear: (selection: YearPeriodSelection) => void;
  onSelect: (selection: PeriodSelection) => void;
  onSearchPress: () => void;
};

export function ExpensesSectionHeader({
  months,
  years,
  selected,
  selected_year,
  onSelectYear,
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

      <View style={styles.periodDropdownSection}>
        <YearDropdown years={years} selected={selected_year} onSelect={onSelectYear} />
        <MonthDropdown months={months} selected={selected} onSelect={onSelect} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  periodDropdownSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  }, header: {
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
