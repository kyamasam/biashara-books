import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarClock, CheckCircle2, CreditCardIcon, Hash } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { formatKes, getLoanById, type LoanPayment } from '@/data/loans';
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
  const loan = getLoanById(id);

  const balance = loan ? loan.total - loan.paid : 0;

  if (!loan) {
    return (
      <View style={[styles.emptyState, { backgroundColor: theme.background }]}>
        <PageHeader title="Loan not found" showBack onBack={() => router.back()} />
        <ThemedText style={styles.emptyText}>This loan could not be found.</ThemedText>
      </View>
    );
  }

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
                source={loan.logo}
                style={styles.logo}
                contentFit="contain"
                accessibilityLabel={`${loan.provider} logo`}
              />
            </View>
            <View style={styles.titleCopy}>
              <ThemedText style={styles.provider}>{loan.provider}</ThemedText>
              <ThemedText style={styles.account}>{loan.account}</ThemedText>
            </View>
            <View style={styles.statusChip}>
              <CheckCircle2 size={12} color={GREEN} strokeWidth={2.4} />
              <ThemedText style={styles.statusText}>{loan.status}</ThemedText>
            </View>
          </View>

          <View style={styles.balanceBlock}>
            <ThemedText style={styles.balanceLabel}>Outstanding balance</ThemedText>
            <ThemedText style={styles.balanceValue}>{formatKes(balance)}</ThemedText>
          </View>

          <View style={styles.summaryGrid}>
            <SummaryCell label="Monthly pay" value={formatKes(loan.monthlyPayment)} />
            <SummaryCell label="Due date" value={loan.due} />
            <SummaryCell label="Rate" value={loan.rate} />
          </View>
        </View>

        <View style={styles.payCard}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Pay loan</ThemedText>
            <ThemedText style={styles.historyMeta}>Paybill source</ThemedText>
          </View>

          <View style={styles.paymentMethod}>
            <View style={styles.methodIcon}>
              <Hash size={18} color={GREEN_DARK} strokeWidth={2.3} />
            </View>
            <View style={styles.methodCopy}>
              <ThemedText style={styles.methodTitle}>Paybill {loan.paybill.number}</ThemedText>
              <ThemedText style={styles.methodMeta}>Account {loan.paybill.account}</ThemedText>
            </View>
          </View>
          <AppButton
            label="Pay loan"
            icon={CreditCardIcon}
            color={GREEN_BRIGHT}
            fullWidth
            onPress={() => router.push({ pathname: '/loan/[id]/pay', params: { id: loan.id } })}
          />
        </View>

        <View style={styles.historySection}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Previous payments</ThemedText>
            <ThemedText style={styles.historyMeta}>{loan.payments.length} records</ThemedText>
          </View>

          <View style={styles.paymentList}>
            {loan.payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
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

function PaymentRow({ payment }: { payment: LoanPayment }) {
  return (
    <View style={styles.paymentRow}>
      <View style={styles.paymentDateIcon}>
        <CalendarClock size={16} color={GREEN_DARK} strokeWidth={2.3} />
      </View>
      <View style={styles.paymentInfo}>
        <ThemedText style={styles.paymentAmount}>{formatKes(payment.amount)}</ThemedText>
        <ThemedText style={styles.paymentMeta}>
          {payment.date} - {payment.method}
        </ThemedText>
      </View>
      <View style={styles.paymentRight}>
        <ThemedText style={styles.paymentStatus}>{payment.status}</ThemedText>
        <ThemedText style={styles.paymentRef}>{payment.reference}</ThemedText>
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
  },
  emptyState: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  emptyText: {
    color: TEXT_MUTED,
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
  confirmationBanner: {
    borderRadius: 12,
    backgroundColor: '#eefaf3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  confirmationCopy: {
    minWidth: 0,
    flex: 1,
  },
  confirmationTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: GREEN_DARK,
  },
  confirmationText: {
    fontSize: 12,
    lineHeight: 16,
    color: GREEN_DARK,
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
  secureBadge: {
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eefaf3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
  },
  secureText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
    color: GREEN_DARK,
  },
  inputLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  amountInputRow: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e6e3',
    backgroundColor: '#fbfcfb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  currencyPrefix: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: TEXT_MUTED,
  },
  amountInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: '#111111',
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  amountChip: {
    minHeight: 32,
    borderRadius: 16,
    backgroundColor: '#f2f6f3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  amountChipText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: GREEN_DARK,
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
  methodChange: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: GREEN,
  },
  historySection: {
    borderRadius: 14,
    backgroundColor: SURFACE,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  historyMeta: {
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_MUTED,
  },
  paymentList: {
    gap: Spacing.one,
  },
  paymentRow: {
    minHeight: 60,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  paymentDateIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#eefaf3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentInfo: {
    flex: 1,
    minWidth: 0,
  },
  paymentAmount: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
  paymentMeta: {
    fontSize: 11,
    lineHeight: 15,
    color: TEXT_MUTED,
  },
  paymentRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  paymentStatus: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: GREEN_DARK,
  },
  paymentRef: {
    fontSize: 10,
    lineHeight: 13,
    color: TEXT_MUTED,
  },
  pressed: {
    opacity: 0.72,
  },
});
