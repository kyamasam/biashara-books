
import ExpoDateTimePicker from '@expo/ui/community/datetime-picker';
import { useRouter } from 'expo-router';
import {
  AlarmClock,
  Archive,
  BatteryFull,
  Bluetooth,
  ChevronDown,
  ChartNoAxesCombined,
  ReceiptText,
  ShoppingBag,
  ShoppingCart,
  SignalHigh,
  TrendingDown,
  WalletCards,
  Wifi,
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState, type ComponentProps, type ComponentType } from 'react';
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BusinessScoreCard } from '@/components/books/business-score-card';
import { HomeHeader } from '@/components/home/home-header';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { useBusinessScoreStore } from '@/store/business-score-store';
import { useStatsStore } from '@/store/stats-store';

type IconComponent = ComponentType<ComponentProps<typeof ShoppingCart>>;

type PerformanceItem = {
  label: string;
  value: string;
  color: string;
  icon: IconComponent;
};

type QuickAction = {
  label: string;
  icon: IconComponent;
  href?: string;
};

type DateRange = {
  startDate: Date;
  endDate: Date;
};

type PresetOption = {
  label: string;
  range: DateRange;
};

const today = new Date();

const startOfDay = (date: Date) => {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const endOfDay = (date: Date) => {
  const nextDate = new Date(date);
  nextDate.setHours(23, 59, 59, 999);
  return nextDate;
};

const subtractDays = (date: Date, days: number) =>
  startOfDay(new Date(date.getTime() - days * 24 * 60 * 60 * 1000));

const getStartOfWeek = (date: Date) => {
  const nextDate = startOfDay(date);
  const day = nextDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  nextDate.setDate(nextDate.getDate() + mondayOffset);
  return nextDate;
};

const getStartOfLastMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() - 1, 1);

const PRESETS: PresetOption[] = [
  { label: 'Today', range: { startDate: startOfDay(today), endDate: endOfDay(today) } },
  {
    label: 'Yesterday',
    range: { startDate: subtractDays(today, 1), endDate: endOfDay(subtractDays(today, 1)) },
  },
  {
    label: 'This Week',
    range: { startDate: getStartOfWeek(today), endDate: endOfDay(today) },
  },
  {
    label: 'Last Week',
    range: {
      startDate: subtractDays(getStartOfWeek(today), 7),
      endDate: endOfDay(subtractDays(getStartOfWeek(today), 1)),
    },
  },
  {
    label: 'Last Month',
    range: {
      startDate: getStartOfLastMonth(today),
      endDate: endOfDay(new Date(today.getFullYear(), today.getMonth(), 0)),
    },
  },
];

const formatDateLabel = (date: Date) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);

const formatRangeLabel = ({ startDate, endDate }: DateRange) => {
  if (startOfDay(startDate).getTime() === startOfDay(endDate).getTime()) {
    return formatDateLabel(startDate);
  }

  return `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`;
};

const formatPerformanceTitle = (selectedPreset: string, dateRange: DateRange) => {
  if (selectedPreset === 'Today') return "Today's Performance";
  if (selectedPreset === 'Yesterday') return "Yesterday's Performance";
  if (selectedPreset) return `${selectedPreset}'s Performance`;
  return `${formatRangeLabel(dateRange)} Performance`;
};

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Make Sale', icon: ReceiptText },
  { label: 'Purchases', icon: ShoppingBag },
  { label: 'Expenses', icon: WalletCards, href: '/expenses' },
  { label: 'Stock', icon: Archive },
];

const formatMoney = (value = 0) =>
  `KES ${value.toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const padDatePart = (value: number) => value.toString().padStart(2, '0');

const formatLocalDateTime = (date: Date) =>
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}T${padDatePart(
    date.getHours(),
  )}:${padDatePart(date.getMinutes())}:${padDatePart(date.getSeconds())}`;

const dateRangeToMonths = (range: DateRange) => {
  const diffMs = range.endDate.getTime() - range.startDate.getTime();
  const diffMonths = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30));
  return Math.max(1, Math.min(12, diffMonths));
};

export default function AccountsScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const { accessToken } = useAuth();
  const { stats, isLoading, error, fetchStats } = useStatsStore();
  const { score, isLoading: scoreLoading, error: scoreError, fetchScore } = useBusinessScoreStore();
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0].label);
  const [dateRange, setDateRange] = useState<DateRange>(PRESETS[0].range);
  const [isRangeDropdownOpen, setIsRangeDropdownOpen] = useState(false);
  const [activeCustomDate, setActiveCustomDate] = useState<'start' | 'end' | null>(null);
  const rangeLabel = selectedPreset || formatRangeLabel(dateRange);
  const performanceTitle = formatPerformanceTitle(selectedPreset, dateRange);

  const performanceItems = useMemo<PerformanceItem[]>(
    () => [
      {
        label: 'Sales\nVolume',
        value: isLoading ? 'Loading...' : formatMoney(stats?.sales),
        color: '#56b985',
        icon: ShoppingCart,
      },
      {
        label: 'Profit',
        value: isLoading ? 'Loading...' : formatMoney(stats?.profit),
        color: '#1464d8',
        icon: ChartNoAxesCombined,
      },
      {
        label: 'Expenses',
        value: isLoading ? 'Loading...' : formatMoney(stats?.expenses),
        color: '#d72450',
        icon: TrendingDown,
      },
      {
        label: 'Stock',
        value: isLoading ? 'Loading...' : `${(stats?.stock ?? 0).toLocaleString('en-KE')} units`,
        color: '#d4bd79',
        icon: Archive,
      },
    ],
    [isLoading, stats],
  );

  const loadStats = useCallback(() => {
    if (!accessToken) return;

    return fetchStats(
      accessToken,
      formatLocalDateTime(dateRange.startDate),
      formatLocalDateTime(dateRange.endDate),
    );
  }, [accessToken, dateRange.endDate, dateRange.startDate, fetchStats]);

  const loadScore = useCallback(() => {
    if (!accessToken) return;
    return fetchScore(accessToken, dateRangeToMonths(dateRange));
  }, [accessToken, dateRange, fetchScore]);

  useEffect(() => {
    void loadStats();
    void loadScore();
  }, [loadStats, loadScore]);

  const handleRefresh = useCallback(() => {
    void loadStats();
    void loadScore();
  }, [loadStats, loadScore]);

  const selectPreset = (preset: PresetOption) => {
    setSelectedPreset(preset.label);
    setDateRange(preset.range);
    setIsRangeDropdownOpen(false);
    setActiveCustomDate(null);
  };

  const selectCustom = () => {
    setSelectedPreset('');
    setIsRangeDropdownOpen(false);
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: safeAreaInsets.top + Spacing.three,
          paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.four,
          paddingLeft: safeAreaInsets.left + 16,
          paddingRight: safeAreaInsets.right + 16,
        },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          tintColor="#05785e"
          colors={['#05785e']}
        />
      }
      showsVerticalScrollIndicator={false}>
      <View style={styles.page}>
        {Platform.OS === 'web' ? <MockStatusBar /> : null}
        <HomeHeader />

        <View style={styles.performanceHeader}>
          <ThemedText style={styles.sectionTitle}>{performanceTitle}</ThemedText>
          <View style={styles.rangePickerContainer}>
            <Pressable
              accessibilityLabel="Select performance date range"
              accessibilityRole="button"
              accessibilityState={{ expanded: isRangeDropdownOpen }}
              onPress={() => setIsRangeDropdownOpen((isOpen) => !isOpen)}
              style={({ pressed }) => [styles.rangeButton, pressed && styles.pressed]}>
              <View style={styles.MonthCardPicker}>
                <ThemedText style={styles.rangeLabel}>{rangeLabel}</ThemedText>
                <ChevronDown size={20} color="#111111" strokeWidth={2.6} />
              </View>
            </Pressable>
            {isRangeDropdownOpen ? (
              <View style={styles.rangeDropdown}>
                {PRESETS.map((preset) => {
                  const isSelected = preset.label === selectedPreset;

                  return (
                    <Pressable
                      key={preset.label}
                      accessibilityRole="menuitem"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => selectPreset(preset)}
                      // style={({ pressed }) => [
                      //   styles.rangeOption,
                      //   isSelected && styles.rangeOptionSelected,
                      //   pressed && styles.pressed,
                      // ]}
                      style={[
                        styles.rangeOption,
                      ]}
                    >
                      <ThemedText
                        style={[styles.rangeOptionLabel, isSelected && styles.rangeOptionLabelSelected]}>
                        {preset.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
                <Pressable
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: selectedPreset === '' }}
                  onPress={selectCustom}
                  style={({ pressed }) => [
                    styles.rangeOption,
                    selectedPreset === '' && styles.rangeOptionSelected,
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText
                    style={[
                      styles.rangeOptionLabel,
                      selectedPreset === '' && styles.rangeOptionLabelSelected,
                    ]}>
                    Custom
                  </ThemedText>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>

        {selectedPreset === '' ? (
          <View style={styles.customRangeCard}>
            <Pressable
              accessibilityLabel="Pick custom start date"
              accessibilityRole="button"
              onPress={() => setActiveCustomDate('start')}
              style={({ pressed }) => [styles.customDateButton, pressed && styles.pressed]}>
              <ThemedText style={styles.customDateCaption}>Start</ThemedText>
              <ThemedText style={styles.customDateValue}>{formatDateLabel(dateRange.startDate)}</ThemedText>
            </Pressable>
            <Pressable
              accessibilityLabel="Pick custom end date"
              accessibilityRole="button"
              onPress={() => setActiveCustomDate('end')}
              style={({ pressed }) => [styles.customDateButton, pressed && styles.pressed]}>
              <ThemedText style={styles.customDateCaption}>End</ThemedText>
              <ThemedText style={styles.customDateValue}>{formatDateLabel(dateRange.endDate)}</ThemedText>
            </Pressable>
          </View>
        ) : null}

        {activeCustomDate ? (
          <ExpoDateTimePicker
            value={activeCustomDate === 'start' ? dateRange.startDate : dateRange.endDate}
            onValueChange={(event, selectedDate) => {
              setActiveCustomDate(null);
              setDateRange((currentRange) => {
                if (activeCustomDate === 'start') {
                  const startDate = startOfDay(selectedDate);
                  const endDate =
                    startDate.getTime() > currentRange.endDate.getTime() ? endOfDay(startDate) : currentRange.endDate;

                  return { startDate, endDate };
                }

                const endDate = endOfDay(selectedDate);
                const startDate =
                  endDate.getTime() < currentRange.startDate.getTime() ? startOfDay(endDate) : currentRange.startDate;

                return { startDate, endDate };
              });
            }}
            onDismiss={() => {
              setActiveCustomDate(null);
            }}
            mode="date"
            presentation="dialog"
          />
        ) : null}

        <View style={styles.performanceGrid}>
          {performanceItems.map((item) => (
            <PerformanceCard key={item.label} item={item} />
          ))}
        </View>

        {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

        <View style={styles.quickActionsSection}>
          <ThemedText style={styles.quickActionsTitle}>Quick Actions</ThemedText>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <QuickActionCard key={action.label} action={action} />
            ))}
          </View>
        </View>

        <BusinessScoreCard
          score={score}
          isLoading={scoreLoading}
          error={scoreError}
          onRefresh={loadScore}
        />
      </View>
    </ScrollView>
  );
}

function MockStatusBar() {
  return (
    <View style={styles.mockStatusBar} aria-hidden>
      <ThemedText style={styles.mockStatusTime}>5:13 PM</ThemedText>
      <View style={styles.mockStatusIcons}>
        <AlarmClock size={19} color="#111111" strokeWidth={2.2} />
        <Bluetooth size={18} color="#111111" strokeWidth={2.4} />
        <Wifi size={19} color="#111111" strokeWidth={2.5} />
        <SignalHigh size={18} color="#111111" strokeWidth={2.6} />
        <BatteryFull size={21} color="#111111" strokeWidth={2.3} />
      </View>
    </View>
  );
}

function PerformanceCard({ item }: { item: PerformanceItem }) {
  const Icon = item.icon;

  return (
    <View style={styles.performanceCard}>
      <View style={[styles.performanceIconCircle, { backgroundColor: item.color }]}>
        <Icon size={18} color="#ffffff" strokeWidth={2.6} />
      </View>
      <View style={styles.performanceText}>
        <ThemedText style={styles.performanceValue}>{item.value}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.performanceLabel}>
          {item.label}
        </ThemedText>
      </View>
    </View>
  );
}

function QuickActionCard({ action }: { action: QuickAction }) {
  const Icon = action.icon;
  const router = useRouter();

  return (
    <Pressable
      accessibilityLabel={action.label}
      accessibilityRole="button"
      onPress={() => {
        console.log('[QuickAction] pressed:', action.label, 'href:', action.href);
        if (action.href) {
          console.log('[QuickAction] calling router.push:', action.href);
          router.push(action.href as never);
          console.log('[QuickAction] router.push called');
        } else {
          console.log('[QuickAction] no href, skipping navigation');
        }
      }}
      style={styles.quickActionCard}>
      <View style={styles.quickActionIconCircle}>
        <Icon size={26} color="#05785e" strokeWidth={2.2} />
      </View>
      <ThemedText style={styles.quickActionLabel}>{action.label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
  },
  page: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: 18,
  },
  mockStatusBar: {
    height: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  mockStatusTime: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#151515',
  },
  mockStatusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  performanceHeader: {
    marginTop: 4,
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    zIndex: 10,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: '#27282c',
  },
  rangeButton: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rangePickerContainer: {
    position: 'relative',
    zIndex: 20,
    elevation: 20,
  },
  MonthCardPicker: {
    minWidth: 132,
    maxWidth: 184,
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  rangeLabel: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 22,
    fontWeight: '700',
    color: '#27282c',
  },
  rangeDropdown: {
    position: 'absolute',
    top: 42,
    right: 0,
    width: 164,
    overflow: 'hidden',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    shadowColor: '#111111',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  rangeOption: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  rangeOptionSelected: {
    backgroundColor: '#eaf4f0',
  },
  rangeOptionLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#27282c',
  },
  rangeOptionLabelSelected: {
    color: '#05785e',
  },
  customRangeCard: {
    flexDirection: 'row',
    gap: 8,
    marginTop: -8,
  },
  customDateButton: {
    flex: 1,
    minHeight: 54,
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  customDateCaption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#666666',
  },
  customDateValue: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#27282c',
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  performanceCard: {
    minWidth: 150,
    flex: 1,
    height: 91,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#111111',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  performanceIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  performanceText: {
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  performanceValue: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: '#242529',
  },
  performanceLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: '#666666',
  },
  errorText: {
    marginTop: -6,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#d72450',
  },
  quickActionsSection: {
    gap: 14,
    paddingTop: Spacing.one,
  },
  quickActionsTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: '#111111',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',


  },
  quickActionCard: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  quickActionIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eaf4f0', // Soft matching green tint background
  },
  quickActionLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#25262a',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
