import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowUpRight, Bell, CalendarClock, CheckCircle2, QrCode, TrendingUp } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { authGet } from '@/lib/api';
import { useUserStore } from '@/store/user-store';
import { formatEndDate, formatKes, type SystemLoan, type SystemLoansResponse } from '@/types/loan';
import { useTheme } from '@/hooks/use-theme';

const GREEN = '#0a8f55';
const GREEN_DARK = '#087747';
const GREEN_BRIGHT = '#33c976';
const ORANGE = '#ff7a1a';
const TEXT_MUTED = '#62676f';

export default function LoansScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const { accessToken } = useAuth();

  const user = useUserStore((s) => s.user);
  const loanLimit = user?.currentBusiness?.shortcodeLoanLimit ?? 0;

  const [loans, setLoans] = useState<SystemLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    authGet<SystemLoansResponse>('/api/loans/system', accessToken)
      .then((res) => setLoans(res.data))
      .catch((err) => setError(err?.message ?? 'Failed to load loans'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  const totalBalance = loans.reduce((sum, l) => sum + l.loanBalance, 0);
  const nextDue = loans.length
    ? loans
        .map((l) => l.endDate)
        .sort()[0]
        .slice(0, 7)
    : null;
  const nextDueLabel = nextDue
    ? new Date(nextDue).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
    : '—';

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
        <LoansHeader />
        <LoanLimitCard loanLimit={loanLimit} />

        <View style={styles.scoreRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Apply for loan"
            style={styles.applyButton}>
            <ThemedText style={styles.applyButtonText}>Apply for loan</ThemedText>
            <ArrowUpRight size={17} color="#ffffff" strokeWidth={2.5} />
          </Pressable>

          <View style={styles.scoreCard}>
            <ThemedText style={styles.scoreLabel}>Business Score</ThemedText>
            <View style={styles.scoreValueRow}>
              <ThemedText style={styles.scoreValue}>125</ThemedText>
              <ThemedText style={styles.scoreTotal}>/800</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.insightsRow}>
          <InsightPill
            icon={TrendingUp}
            label="Total loans"
            value={totalBalance > 0 ? formatKes(totalBalance) : '—'}
            tone="#e9f8ef"
          />
          <InsightPill icon={CalendarClock} label="Next due" value={nextDueLabel} tone="#fff3e7" />
          <InsightPill icon={CheckCircle2} label="Health" value="Good" tone="#eef1ff" />
        </View>

        <View style={styles.loansSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Your Loans</ThemedText>
            <ThemedText style={styles.sectionMeta}>{loans.length} active</ThemedText>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={GREEN} style={styles.loader} />
          ) : error ? (
            <View style={styles.errorState}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : loans.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No loans found.</ThemedText>
            </View>
          ) : (
            loans.map((loan) => <LoanCard key={loan.id} loan={loan} />)
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function LoansHeader() {
  return (
    <View style={styles.header}>
      <ThemedText style={styles.headerTitle}>Loans</ThemedText>
      <View style={styles.headerActions}>
        <Pressable accessibilityRole="button" accessibilityLabel="Scan loan QR code" style={styles.headerButton}>
          <QrCode size={24} color="#111111" strokeWidth={2.6} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Loan notifications" style={styles.headerButton}>
          <Bell size={24} color="#111111" strokeWidth={2.6} />
          <View style={styles.notificationDot} />
        </Pressable>
      </View>
    </View>
  );
}

function LoanLimitCard({ loanLimit }: { loanLimit: number }) {
  const [whole, decimal] = loanLimit.toLocaleString('en-KE', { minimumFractionDigits: 0 }).split('.');

  return (
    <View style={styles.limitCard}>
      <View style={[styles.limitBubble, styles.limitBubbleLarge]} />
      <View style={[styles.limitBubble, styles.limitBubbleSmall]} />
      <View style={styles.limitShade} />

      <ThemedText style={styles.limitLabel}>Loan Limit</ThemedText>
      <View style={styles.limitAmountRow}>
        <ThemedText style={styles.limitCurrency}>KES</ThemedText>
        <ThemedText style={styles.limitAmount}>{whole}</ThemedText>
      </View>
      <View style={styles.limitGrowthRow}>
        <TrendingUp size={13} color="rgba(255,255,255,0.88)" strokeWidth={2.2} />
        <ThemedText style={styles.limitGrowth}>Based on your business activity</ThemedText>
      </View>
    </View>
  );
}

function LoanCard({ loan }: { loan: SystemLoan }) {
  const router = useRouter();
  const channelLabel = loan.institutionType.charAt(0).toUpperCase() + loan.institutionType.slice(1);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${loan.institutionName} loan balance ${formatKes(loan.loanBalance)}`}
      onPress={() => router.push({ pathname: '/loan/[id]', params: { id: loan.id } })}
      style={styles.loanCard}>
      <View style={styles.loanTopRow}>
        <View style={styles.loanIdentity}>
          <BankLogo loan={loan} />
          <ThemedText style={styles.loanName}>{loan.institutionName}</ThemedText>
        </View>
        <View style={styles.balanceColumn}>
          <ThemedText style={styles.balanceValue}>{formatKes(loan.loanBalance)}</ThemedText>
          <ThemedText style={styles.balanceLabel}>balance</ThemedText>
        </View>
      </View>

      <View style={styles.loanMetaRow}>
        <ThemedText style={styles.loanMeta}>
          {channelLabel} · KES {loan.monthlyRepaymentAmount.toLocaleString('en-KE')}/mo
        </ThemedText>
        <ThemedText style={styles.loanDue}>Ends {formatEndDate(loan.endDate)}</ThemedText>
      </View>

      <View style={styles.statusChip}>
        <CheckCircle2 size={12} color={GREEN_DARK} strokeWidth={2.4} />
        <ThemedText style={[styles.statusText, { color: GREEN_DARK }]}>Active</ThemedText>
      </View>
    </Pressable>
  );
}

function BankLogo({ loan }: { loan: SystemLoan }) {
  return (
    <View style={styles.bankLogoFrame}>
      <Image
        source={loan.institutionLogoUrl ? { uri: loan.institutionLogoUrl } : undefined}
        style={styles.bankLogo}
        contentFit="contain"
        transition={120}
        accessibilityLabel={`${loan.institutionName} logo`}
      />
    </View>
  );
}

function InsightPill({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <View style={[styles.insightPill, { backgroundColor: tone }]}>
      <Icon size={15} color={GREEN_DARK} strokeWidth={2.4} />
      <View style={styles.insightText}>
        <ThemedText style={styles.insightLabel}>{label}</ThemedText>
        <ThemedText style={styles.insightValue}>{value}</ThemedText>
      </View>
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
    minHeight: 760,
  },
  header: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    right: 6,
    top: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b30',
  },
  limitCard: {
    height: 118,
    borderRadius: 24,
    backgroundColor: GREEN,
    overflow: 'hidden',
    paddingHorizontal: 28,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  limitBubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#08b96a',
  },
  limitBubbleLarge: {
    width: 166,
    height: 166,
    right: -24,
    top: -86,
    opacity: 0.28,
  },
  limitBubbleSmall: {
    width: 92,
    height: 92,
    right: -18,
    bottom: -26,
    opacity: 0.8,
  },
  limitShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    backgroundColor: 'rgba(1,98,56,0.24)',
  },
  limitLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  limitAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
    marginTop: 3,
  },
  limitCurrency: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#ffffff',
  },
  limitAmount: {
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '700',
    color: '#ffffff',
  },
  limitGrowthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  limitGrowth: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  scoreRow: {
    minHeight: 56,
    marginTop: -2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  applyButton: {
    flex: 1,
    minWidth: 0,
    height: 44,
    borderRadius: 24,
    backgroundColor: GREEN_BRIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#0a8f55',
    shadowOpacity: 0.13,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  applyButtonText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  scoreCard: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    maxWidth: 210,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: '#1f2937',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  scoreLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  scoreValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
    color: ORANGE,
  },
  scoreTotal: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
    color: ORANGE,
  },
  insightsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  insightPill: {
    minWidth: 0,
    flex: 1,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: Spacing.two,
  },
  insightText: {
    minWidth: 0,
  },
  insightLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  insightValue: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
  loansSection: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  sectionHeader: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  sectionMeta: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  loader: {
    marginTop: Spacing.four,
  },
  errorState: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  emptyText: {
    color: TEXT_MUTED,
    fontSize: 14,
    lineHeight: 20,
  },
  loanCard: {
    minHeight: 96,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 11,
    shadowColor: '#111827',
    shadowOpacity: 0.025,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  bankLogoFrame: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#edf0ee',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  bankLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  loanTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  loanIdentity: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  loanName: {
    minWidth: 0,
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  balanceColumn: {
    alignItems: 'flex-end',
    gap: 1,
  },
  balanceValue: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  balanceLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '400',
    color: TEXT_MUTED,
  },
  loanMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: 2,
  },
  loanMeta: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_MUTED,
  },
  loanDue: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginTop: 2,
    height: 22,
    borderRadius: 11,
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
  },
});
