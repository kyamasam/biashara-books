import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { AlertTriangle, ArrowUpRight, Bell, CalendarClock, CheckCircle2, QrCode, TrendingUp, XCircle } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { formatKes, LOANS, type Loan } from '@/data/loans';
import { useTheme } from '@/hooks/use-theme';

const GREEN = '#0a8f55';
const GREEN_DARK = '#087747';
const GREEN_BRIGHT = '#33c976';
const ORANGE = '#ff7a1a';
const TEXT_MUTED = '#62676f';

const STATUS_CONFIG = {
  'On Track': {
    icon: CheckCircle2,
    color: GREEN_DARK,
    bg: '#eefaf3',
  },
  'Poor Perfoming': {
    icon: AlertTriangle,
    color: '#b45309',
    bg: '#fff7ed',
  },
  Defaulted: {
    icon: XCircle,
    color: '#b91c1c',
    bg: '#fef2f2',
  },
} as const;

export default function LoansScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

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
        <LoanLimitCard />

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
          <InsightPill icon={TrendingUp} label="Total loans" value="KES 6M" tone="#e9f8ef" />
          <InsightPill icon={CalendarClock} label="Next due" value="Apr 28" tone="#fff3e7" />
          <InsightPill icon={CheckCircle2} label="Health" value="Good" tone="#eef1ff" />
        </View>

        <View style={styles.loansSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Your Loans</ThemedText>
            <ThemedText style={styles.sectionMeta}>{LOANS.length} active</ThemedText>
          </View>

          {LOANS.map((loan) => (
            <LoanCard key={loan.provider} loan={loan} />
          ))}
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

function LoanLimitCard() {
  return (
    <View style={styles.limitCard}>
      <View style={[styles.limitBubble, styles.limitBubbleLarge]} />
      <View style={[styles.limitBubble, styles.limitBubbleSmall]} />
      <View style={styles.limitShade} />

      <ThemedText style={styles.limitLabel}>Loan Limit</ThemedText>
      <View style={styles.limitAmountRow}>
        <ThemedText style={styles.limitCurrency}>KES</ThemedText>
        <ThemedText style={styles.limitAmount}>3,000,000</ThemedText>
      </View>
      <View style={styles.limitGrowthRow}>
        <TrendingUp size={13} color="rgba(255,255,255,0.88)" strokeWidth={2.2} />
        <ThemedText style={styles.limitGrowth}>+4,000 Kes This Month</ThemedText>
      </View>
    </View>
  );
}

function LoanCard({ loan }: { loan: Loan }) {
  const progress = Math.min(loan.paid / loan.total, 1);
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${loan.provider} loan balance ${formatKes(loan.total - loan.paid)}`}
      onPress={() => router.push({ pathname: '/loan/[id]', params: { id: loan.id } })}
      style={styles.loanCard}>
      <View style={styles.loanTopRow}>
        <View style={styles.loanIdentity}>
          <BankLogo loan={loan} />
          <ThemedText style={styles.loanName}>{loan.provider}</ThemedText>
        </View>
        <View style={styles.balanceColumn}>
          <ThemedText style={styles.balanceValue}>{formatKes(loan.total - loan.paid)}</ThemedText>
          <ThemedText style={styles.balanceLabel}>balance</ThemedText>
        </View>
      </View>

      <View style={styles.loanMetaRow}>
        <ThemedText style={styles.loanMeta}>
          {loan.channel} - KES {loan.monthlyPayment.toLocaleString('en-KE')}/mo
        </ThemedText>
        <ThemedText style={styles.loanDue}>Due {loan.due}</ThemedText>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.loanBottomRow}>
        <ThemedText style={styles.loanFoot}>{formatKes(loan.paid)} Paid</ThemedText>
        <ThemedText style={styles.loanFoot}>of {formatKes(loan.total)}</ThemedText>
      </View>

      {(() => {
        const cfg = STATUS_CONFIG[loan.status];
        const StatusIcon = cfg.icon;
        return (
          <View style={[styles.statusChip, { backgroundColor: cfg.bg }]}>
            <StatusIcon size={12} color={cfg.color} strokeWidth={2.4} />
            <ThemedText style={[styles.statusText, { color: cfg.color }]}>{loan.status}</ThemedText>
          </View>
        );
      })()}
    </Pressable>
  );
}

function BankLogo({ loan }: { loan: Loan }) {
  return (
    <View style={styles.bankLogoFrame}>
      <Image
        source={loan.logo}
        style={styles.bankLogo}
        contentFit="contain"
        transition={120}
        accessibilityLabel={`${loan.provider} logo`}
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
  loanCard: {
    minHeight: 116,
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
  progressTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: '#edf0ee',
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: GREEN_BRIGHT,
  },
  loanBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: 4,
  },
  loanFoot: {
    fontSize: 11,
    lineHeight: 14,
    color: TEXT_MUTED,
  },
  statusChip: {
    alignSelf: 'flex-start',
    marginTop: 5,
    height: 22,
    borderRadius: 11,
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
  pressed: {
    opacity: 0.72,
  },
});
