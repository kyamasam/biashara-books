import { useRouter } from 'expo-router';
import { Package } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const METRICS = [
  { label: 'Today sales', value: 'KES 82.4k', detail: 'Up 12% from yesterday' },
  { label: 'Transactions', value: '18', detail: 'Average basket KES 4.6k' },
  { label: 'Refunds', value: '0', detail: 'No reversals recorded' },
];

const ACTIONS = [
  { title: 'Start a new sale', detail: 'Add items, apply discounts, and issue a receipt.' },
  { title: 'Hold orders', detail: 'Two parked carts are waiting for checkout.' },
  { title: 'Low stock alerts', detail: 'Five fast-moving items need restocking.' },
];

export default function PosScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: safeAreaInsets.top + Spacing.four,
          paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.four,
          paddingLeft: safeAreaInsets.left + Spacing.four,
          paddingRight: safeAreaInsets.right + Spacing.four,
        },
      ]}>
      <ThemedView style={styles.page}>
        <View style={styles.header}>
          <ThemedText type="subtitle">POS</ThemedText>
          <ThemedText themeColor="textSecondary">
            Sell, receipt, and track shop activity from one place.
          </ThemedText>
        </View>

        <View style={styles.metricsGrid}>
          {METRICS.map((metric) => (
            <ThemedView key={metric.label} type="backgroundElement" style={styles.metricCard}>
              <ThemedText type="small" themeColor="textSecondary">
                {metric.label}
              </ThemedText>
              <ThemedText type="subtitle" style={styles.metricValue}>
                {metric.value}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {metric.detail}
              </ThemedText>
            </ThemedView>
          ))}
        </View>

        <AppButton
          label="Add Product"
          icon={Package}
          variant="secondary"
          fullWidth
          onPress={() => router.push('/products/new')}
        />

        <View style={styles.section}>
          <ThemedText type="smallBold">Today</ThemedText>
          <View style={styles.actionList}>
            {ACTIONS.map((action) => (
              <ThemedView key={action.title} type="backgroundElement" style={styles.actionRow}>
                <View style={styles.actionText}>
                  <ThemedText type="smallBold">{action.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {action.detail}
                  </ThemedText>
                </View>
              </ThemedView>
            ))}
          </View>
        </View>
      </ThemedView>
    </ScrollView>
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
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.one,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  metricCard: {
    minWidth: 180,
    flex: 1,
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  metricValue: {
    lineHeight: 28,
  },
  section: {
    gap: Spacing.two,
  },
  actionList: {
    gap: Spacing.two,
  },
  actionRow: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  actionText: {
    gap: Spacing.half,
  },
});
