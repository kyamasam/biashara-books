import { ChevronDown, X } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { DateData } from 'react-native-calendars';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export type MonthPeriod = {
  type: 'month';
  label: string;
  value: string;
};

export type CustomPeriod = {
  type: 'custom';
  startDate: string;
  endDate: string;
};

export type PeriodSelection = MonthPeriod | CustomPeriod;

type MonthDropdownProps = {
  months: MonthPeriod[];
  selected: PeriodSelection;
  onSelect: (selection: PeriodSelection) => void;
};

function formatCustomLabel(startDate: string, endDate: string): string {
  const fmt = (d: string) => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
  };
  return `${fmt(startDate)} – ${fmt(endDate)}`;
}

function buildRangeMarkedDates(
  start: string | null,
  end: string | null,
): Record<string, object> {
  if (!start) return {};
  const accentColor = '#111111';
  const rangeColor = '#e5e7eb';

  if (!end || start === end) {
    return {
      [start]: {
        startingDay: true,
        endingDay: true,
        color: accentColor,
        textColor: '#ffffff',
      },
    };
  }

  const marks: Record<string, object> = {};
  const current = new Date(start + 'T00:00:00');
  const last = new Date(end + 'T00:00:00');

  while (current <= last) {
    const key = current.toISOString().split('T')[0];
    if (key === start) {
      marks[key] = { startingDay: true, color: accentColor, textColor: '#ffffff' };
    } else if (key === end) {
      marks[key] = { endingDay: true, color: accentColor, textColor: '#ffffff' };
    } else {
      marks[key] = { color: rangeColor, textColor: '#111111' };
    }
    current.setDate(current.getDate() + 1);
  }
  return marks;
}

export function MonthDropdown({ months, selected, onSelect }: MonthDropdownProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const label =
    selected.type === 'month'
      ? selected.label
      : formatCustomLabel(selected.startDate, selected.endDate);

  const markedDates = useMemo(
    () => buildRangeMarkedDates(rangeStart, rangeEnd),
    [rangeStart, rangeEnd],
  );

  const openModal = () => {
    setView('list');
    setRangeStart(null);
    setRangeEnd(null);
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  const handleMonthSelect = (month: MonthPeriod) => {
    onSelect(month);
    closeModal();
  };

  const handleDayPress = useCallback(
    (day: DateData) => {
      const date = day.dateString;
      if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(date);
        setRangeEnd(null);
      } else {
        if (date < rangeStart) {
          setRangeEnd(rangeStart);
          setRangeStart(date);
        } else {
          setRangeEnd(date);
        }
      }
    },
    [rangeStart, rangeEnd],
  );

  const handleApplyRange = () => {
    if (rangeStart && rangeEnd) {
      onSelect({ type: 'custom', startDate: rangeStart, endDate: rangeEnd });
      closeModal();
    }
  };

  const canApply = Boolean(rangeStart && rangeEnd);

  return (
    <>
      <Pressable
        onPress={openModal}
        accessibilityLabel="Select period"
        accessibilityRole="button"
        style={styles.trigger}>
        <ThemedText style={styles.triggerLabel}>{label}</ThemedText>
        <ChevronDown size={15} color="#111111" strokeWidth={2.6} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={closeModal}>
        <Pressable style={styles.backdrop} onPress={closeModal} />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.three }]}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <ThemedText style={styles.sheetTitle}>
              {view === 'list' ? 'Select Period' : 'Custom Range'}
            </ThemedText>
            <Pressable onPress={closeModal} hitSlop={12} style={styles.closeBtn}>
              <X size={18} color="#60646C" strokeWidth={2.2} />
            </Pressable>
          </View>

          {view === 'list' && (
            <ScrollView
              style={styles.listScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}>
              {months.map((month, index) => {
                const isSelected =
                  selected.type === 'month' && selected.value === month.value;
                return (
                  <Pressable
                    key={month.value}
                    onPress={() => handleMonthSelect(month)}
                    style={({ pressed }) => [
                      styles.listItem,
                      index < months.length - 1 && styles.listItemBorder,
                      isSelected && styles.listItemSelected,
                      pressed && styles.listItemPressed,
                    ]}>
                    <ThemedText
                      style={[styles.listItemText, isSelected && styles.listItemTextSelected]}>
                      {month.label}
                    </ThemedText>
                    {isSelected && <View style={styles.selectedDot} />}
                  </Pressable>
                );
              })}

              {/* Custom Range row */}
              <Pressable
                onPress={() => {
                  setRangeStart(null);
                  setRangeEnd(null);
                  setView('calendar');
                }}
                style={({ pressed }) => [
                  styles.listItem,
                  styles.customRow,
                  pressed && styles.listItemPressed,
                ]}>
                <ThemedText style={styles.customRowText}>Custom Range</ThemedText>
                <View style={styles.customBadge}>
                  <ThemedText style={styles.customBadgeText}>Pick dates</ThemedText>
                </View>
              </Pressable>
            </ScrollView>
          )}

          {view === 'calendar' && (
            <>
              <ThemedText style={styles.calendarHint}>
                {!rangeStart
                  ? 'Tap a start date'
                  : !rangeEnd
                    ? 'Tap an end date'
                    : formatCustomLabel(rangeStart, rangeEnd)}
              </ThemedText>

              <Calendar
                markingType="period"
                markedDates={markedDates}
                onDayPress={handleDayPress}
                theme={calendarTheme}
                style={styles.calendar}
              />

              {/* Actions pinned below calendar, never off-screen */}
              <View style={styles.calendarActions}>
                <Pressable
                  onPress={() => setView('list')}
                  style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
                  <ThemedText style={styles.backBtnText}>Back</ThemedText>
                </Pressable>

                <Pressable
                  onPress={handleApplyRange}
                  disabled={!canApply}
                  style={({ pressed }) => [
                    styles.applyBtn,
                    !canApply && styles.applyBtnDisabled,
                    pressed && canApply && { opacity: 0.85 },
                  ]}>
                  <ThemedText style={styles.applyBtnText}>Apply</ThemedText>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </Modal>
    </>
  );
}

const calendarTheme = {
  backgroundColor: '#ffffff',
  calendarBackground: '#ffffff',
  textSectionTitleColor: '#60646C',
  selectedDayBackgroundColor: '#111111',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#111111',
  dayTextColor: '#111111',
  textDisabledColor: '#d1d5db',
  arrowColor: '#111111',
  monthTextColor: '#111111',
  textMonthFontWeight: '700' as const,
  textDayFontSize: 14,
  textMonthFontSize: 15,
  textDayHeaderFontSize: 12,
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  triggerPressed: {
    opacity: 0.75,
    borderColor: '#9ca3af',
  },
  triggerLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#111111',
  },

  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
    // Keep the sheet from growing past the screen so actions are always visible
    maxHeight: '90%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
    alignSelf: 'center',
    marginBottom: Spacing.three,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  closeBtn: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },

  // Month list
  listScroll: {
    maxHeight: 380,
  },
  listContent: {
    paddingBottom: Spacing.two,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: Spacing.two,
    borderRadius: 10,
  },
  listItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6',
  },
  listItemSelected: {
    backgroundColor: '#f9fafb',
  },
  listItemPressed: {
    backgroundColor: '#f3f4f6',
  },
  listItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111111',
  },
  listItemTextSelected: {
    fontWeight: '700',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#111111',
  },

  // Custom row
  customRow: {
    marginTop: Spacing.two,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  customRowText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
  customBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  customBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#60646C',
  },

  // Calendar
  calendarHint: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    color: '#60646C',
    marginBottom: Spacing.two,
    minHeight: 20,
  },
  calendar: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    overflow: 'hidden',
  },
  calendarActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  backBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#60646C',
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#111111',
    alignItems: 'center',
  },
  applyBtnDisabled: {
    backgroundColor: '#d1d5db',
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
