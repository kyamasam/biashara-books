import { TrendingUp } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

import type { ExpenseSummary } from './expenses-data';

const CARD_GREEN = '#2a7d4f';
const CARD_GREEN_LIGHT = '#3a9d64';

type ExpensesSummaryCardProps = {
  summary: ExpenseSummary;
};

export function ExpensesSummaryCard({ summary }: ExpensesSummaryCardProps) {
  return (
    <View style={styles.card}>
      {/* Decorative background circles */}
      <View style={[styles.circle, styles.circleLarge]} />
      <View style={[styles.circle, styles.circleSmall]} />

      <ThemedText style={styles.subtitle}>Total Spent - {summary.month}</ThemedText>

      <View style={styles.amountRow}>
        <ThemedText style={styles.currency}>KES</ThemedText>
        <ThemedText style={styles.amount}>
          {summary.totalSpent.toLocaleString('en-KE')}
        </ThemedText>
      </View>

      <View style={styles.pointsRow}>
        <TrendingUp size={13} color="rgba(255,255,255,0.85)" strokeWidth={2.2} />
        <ThemedText style={styles.pointsText}>
          +{summary.pointsEarned.toLocaleString('en-KE')} Pts This Month
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: CARD_GREEN,
    padding: 20,
    justifyContent: 'flex-end',
    gap: 4,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: CARD_GREEN_LIGHT,
    opacity: 0.45,
  },
  circleLarge: {
    width: 180,
    height: 180,
    top: -50,
    right: -30,
  },
  circleSmall: {
    width: 100,
    height: 100,
    bottom: -20,
    right: 60,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  currency: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  amount: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700',
    color: '#ffffff',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
  },
});
