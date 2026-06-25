import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarClock, CheckCircle2, CreditCardIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { authGet } from '@/lib/api';
import { formatEndDate, formatKes, type SystemLoan, type SystemLoanResponse } from '@/types/loan';
import { useTheme } from '@/hooks/use-theme';

const GREEN = '#0a8f55';
const GREEN_DARK = '#087747';
const GREEN_BRIGHT = '#33c976';
const TEXT_MUTED = '#62676f';
const SURFACE = '#ffffff';

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { accessToken } = useAuth();

  const [loan, setLoan] = useState<SystemLoan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !id) return;
    setLoading(true);
    authGet<SystemLoanResponse>(`/api/loans/system/${id}`, accessToken)
      .then((res) => setLoan(res.data))
      .catch((err) => setError(err?.message ?? 'Failed to load loan'))
      .finally(() => setLoading(false));
  }, [accessToken, id]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <PageHeader title="Loan Details" showBack onBack={() => router.back()} />
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  if (error || !loan) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <PageHeader title="Loan not found" showBack onBack={() => router.back()} />
        <ThemedText style={styles.errorText}>{error ?? 'This loan could not be found.'}</ThemedText>
      </View>
    );
  }

  const channelLabel = loan.institutionType.charAt(0).toUpperCase() + loan.institutionType.slice(1);

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: safeAreaInsets.top + Spacing.three,
          paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.four,
          paddingLeft: safeAreaInsets.left + Spacing.three,
          paddingRight: safeAreaInsets.right + Spacing.three,
        },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.page}>
        <PageHeader title="Loan Details" showBack />

        <View style={styles.heroCard}>
          <View style={styles.loanTitleRow}>
            <View style={styles.logoFrame}>
              <Image
                source={loan.institutionLogoUrl ? { uri: loan.institutionLogoUrl } : undefined}
                style={styles.logo}
                contentFit="contain"
                accessibilityLabel={`${loan.institutionName} logo`}
              />
            </View>
            <View style={styles.titleCopy}>
              <ThemedText style={styles.provider}>{loan.institutionName}</ThemedText>
              <ThemedText style={styles.account}>{channelLabel}</ThemedText>
            </View>
            <View style={styles.statusChip}>
              <CheckCircle2 size={12} color={GREEN} strokeWidth={2.4} />
              <ThemedText style={styles.statusText}>Active</ThemedText>
            </View>
          </View>

          <View style={styles.balanceBlock}>
            <ThemedText style={styles.balanceLabel}>Outstanding balance</ThemedText>
            <ThemedText style={styles.balanceValue}>{formatKes(loan.loanBalance)}</ThemedText>
          </View>

          <View style={styles.summaryGrid}>
            <SummaryCell label="Monthly pay" value={formatKes(loan.monthlyRepaymentAmount)} />
            <SummaryCell label="End date" value={formatEndDate(loan.endDate)} />
            <SummaryCell label="Type" value={channelLabel} />
          </View>
        </View>

        <View style={styles.payCard}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Record payment</ThemedText>
          </View>

          <View style={styles.paymentMethod}>
            <View style={styles.methodIcon}>
              <CalendarClock size={18} color={GREEN_DARK} strokeWidth={2.3} />
            </View>
            <View style={styles.methodCopy}>
              <ThemedText style={styles.methodTitle}>Monthly repayment</ThemedText>
              <ThemedText style={styles.methodMeta}>{formatKes(loan.monthlyRepaymentAmount)} due monthly</ThemedText>
            </View>
          </View>
          <AppButton
            label="Record payment"
            icon={CreditCardIcon}
            color={GREEN_BRIGHT}
            fullWidth
            onPress={() => router.push({ pathname: '/loan/[id]/pay', params: { id: loan.id } })}
          />
        </View>

        <View style={styles.historySection}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Payment history</ThemedText>
          </View>
          <View style={styles.emptyHistory}>
            <ThemedText style={styles.emptyHistoryText}>No payment records yet.</ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryCell}>
      <ThemedText style={styles.summaryLabel}>{label}</ThemedText>
      <ThemedText style={styles.summaryValue}>{value}</ThemedText>
    </View>
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
    gap: Spacing.three,
  },
  centered: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 20,
  },
  heroCard: {
    borderRadius: 14,
    backgroundColor: SURFACE,
    padding: Spacing.three,
    gap: Spacing.three,
    shadowColor: '#111827',
    shadowOpacity: 0.025,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  loanTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  logoFrame: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#edf0ee',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  titleCopy: {
    minWidth: 0,
    flex: 1,
  },
  provider: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  account: {
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_MUTED,
  },
  statusChip: {
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eefaf3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
  },
  statusText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    color: GREEN_DARK,
  },
  balanceBlock: {
    gap: 3,
  },
  balanceLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_MUTED,
  },
  balanceValue: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  summaryCell: {
    flex: 1,
    minWidth: 0,
    borderRadius: 10,
    backgroundColor: '#f6f8f7',
    padding: Spacing.two,
    gap: 3,
  },
  summaryLabel: {
    fontSize: 10,
    lineHeight: 13,
    color: TEXT_MUTED,
  },
  summaryValue: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  payCard: {
    borderRadius: 14,
    backgroundColor: SURFACE,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cardHeader: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
  },
  paymentMethod: {
    minHeight: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#edf0ee',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
  },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eefaf3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodCopy: {
    minWidth: 0,
    flex: 1,
  },
  methodTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
  methodMeta: {
    fontSize: 11,
    lineHeight: 14,
    color: TEXT_MUTED,
  },
  historySection: {
    borderRadius: 14,
    backgroundColor: SURFACE,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  emptyHistoryText: {
    fontSize: 13,
    lineHeight: 18,
    color: TEXT_MUTED,
  },
});
