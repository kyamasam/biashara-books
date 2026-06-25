import { RefreshCw } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { BusinessScore } from '@/store/business-score-store';

type Props = {
  score: BusinessScore | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
};

const formatMoney = (value = 0) =>
  `KES ${value.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Very Good';
  if (score >= 50) return 'Good';
  if (score >= 25) return 'Fair';
  return 'Poor';
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#05785e';
  if (score >= 75) return '#56b985';
  if (score >= 50) return '#1464d8';
  if (score >= 25) return '#e8a530';
  return '#d72450';
}

type BreakdownBarProps = {
  label: string;
  value: number;
  color: string;
};

function BreakdownBar({ label, value, color }: BreakdownBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <View style={barStyles.row}>
      <ThemedText style={barStyles.label}>{label}</ThemedText>
      <View style={barStyles.track}>
        <View style={[barStyles.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <ThemedText style={barStyles.pct}>{value.toFixed(1)}</ThemedText>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    width: 84,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#666666',
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f0f0f3',
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
  pct: {
    width: 34,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#27282c',
    textAlign: 'right',
  },
});

export function BusinessScoreCard({ score, isLoading, error, onRefresh }: Props) {
  const scoreValue = score?.score ?? 0;
  const scoreColor = getScoreColor(scoreValue);
  const scoreLabel = getScoreLabel(scoreValue);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Business Score</ThemedText>
        <Pressable
          accessibilityLabel="Refresh business score"
          accessibilityRole="button"
          onPress={onRefresh}
          style={styles.refreshButton}>
          <RefreshCw size={16} color="#666666" strokeWidth={2.4} />
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color="#05785e" style={styles.loader} />
      ) : error ? (
        <ThemedText style={styles.error}>{error}</ThemedText>
      ) : score ? (
        <>
          <View style={styles.scoreRow}>
            <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
              <ThemedText style={[styles.scoreNumber, { color: scoreColor }]}>
                {scoreValue.toFixed(0)}
              </ThemedText>
              <ThemedText style={styles.scoreMax}>/100</ThemedText>
            </View>

            <View style={styles.scoreDetails}>
              <View style={[styles.scoreBadge, { backgroundColor: `${scoreColor}1a` }]}>
                <ThemedText style={[styles.scoreBadgeText, { color: scoreColor }]}>
                  {scoreLabel}
                </ThemedText>
              </View>
              <ThemedText style={styles.loanLimitCaption}>Suggested loan limit</ThemedText>
              <ThemedText style={[styles.loanLimitValue, { color: scoreColor }]}>
                {formatMoney(score.loanLimit)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.breakdown}>
            <ThemedText style={styles.breakdownTitle}>Score Breakdown</ThemedText>
            <BreakdownBar label="Sales" value={score.breakdown.sales} color="#56b985" />
            <BreakdownBar label="Transactions" value={score.breakdown.transactions} color="#1464d8" />
            <BreakdownBar label="Expenses" value={score.breakdown.expenses} color="#e8a530" />
            <BreakdownBar label="Loans" value={score.breakdown.loans} color="#d72450" />
          </View>

          <ThemedText style={styles.period}>
            Based on last {score.periodMonths} month{score.periodMonths !== 1 ? 's' : ''}
          </ThemedText>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 14,
    shadowColor: '#111111',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: '#27282c',
  },
  refreshButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    marginVertical: 12,
    alignSelf: 'center',
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#d72450',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  scoreCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 1,
  },
  scoreNumber: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#999999',
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  scoreDetails: {
    flex: 1,
    gap: 6,
  },
  scoreBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  scoreBadgeText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  loanLimitCaption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#888888',
  },
  loanLimitValue: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f3',
    marginHorizontal: -16,
  },
  breakdown: {
    gap: 8,
  },
  breakdownTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#888888',
    marginBottom: 2,
  },
  period: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: '#aaaaaa',
    textAlign: 'right',
  },
});
