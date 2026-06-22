import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CreditCardIcon, Hash, Landmark, ReceiptText, ShieldCheck } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { formatKes, getLoanById } from '@/data/loans';
import { useTheme } from '@/hooks/use-theme';

const GREEN_DARK = '#087747';
const GREEN_BRIGHT = '#33c976';
const TEXT_MUTED = '#62676f';
const SURFACE = '#ffffff';

export default function LoanPaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const loan = getLoanById(id);
  const balance = loan ? loan.total - loan.paid : 0;
  const [amount, setAmount] = useState(() => String(loan?.monthlyPayment ?? 0));
  const amountValue = Number(amount.replace(/,/g, '')) || 0;
  const paymentOptions = useMemo(
    () =>
      loan
        ? [
          loan.monthlyPayment,
          Math.min(balance, loan.monthlyPayment * 2),
          balance,
        ].filter((value, index, values) => value > 0 && values.indexOf(value) === index)
        : [],
    [balance, loan]
  );

  if (!loan) {
    return (
      <View style={[styles.emptyState, { backgroundColor: theme.background }]}>
        <PageHeader title="Payment" showBack onBack={() => router.back()} />
        <ThemedText style={styles.emptyText}>This loan could not be found.</ThemedText>
      </View>
    );
  }

  function handlePay() {
    if (!loan || amountValue <= 0) {
      return;
    }

    router.push({
      pathname: '/loan/[id]/success',
      params: {
        id: loan.id,
        amount: String(amountValue),
      },
    });
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
        <PageHeader title="Pay Loan" showBack />

        <View style={styles.loanCard}>
          <View style={styles.loanHeader}>
            <View style={styles.logoFrame}>
              <Image
                source={loan.logo}
                style={styles.logo}
                contentFit="contain"
                accessibilityLabel={`${loan.provider} logo`}
              />
            </View>
            <View style={styles.loanCopy}>
              <ThemedText style={styles.provider}>{loan.provider}</ThemedText>
              <ThemedText style={styles.account}>{loan.account}</ThemedText>
            </View>
          </View>

          <View style={styles.balanceRow}>
            <ThemedText style={styles.balanceLabel}>Outstanding</ThemedText>
            <ThemedText style={styles.balanceValue}>{formatKes(balance)}</ThemedText>
          </View>
        </View>

        <View style={styles.sourceCard}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Payment source</ThemedText>
            <View style={styles.secureBadge}>
              <ShieldCheck size={13} color={GREEN_DARK} strokeWidth={2.4} />
              <ThemedText style={styles.secureText}>Secure</ThemedText>
            </View>
          </View>

          <View style={styles.paybillPanel}>
            <View style={styles.paybillIcon}>
              <Hash size={22} color={GREEN_DARK} strokeWidth={2.4} />
            </View>
            <View style={styles.paybillCopy}>
              <ThemedText style={styles.paybillTitle}>Paybill {loan.paybill.number}</ThemedText>
              <ThemedText style={styles.paybillMeta}>Account {loan.paybill.account}</ThemedText>
            </View>
          </View>

          <View style={styles.detailGrid}>
            <DetailCell icon={Landmark} label="Biller" value={loan.provider} />
            <DetailCell icon={ReceiptText} label="Reference" value={loan.paybill.account} />
          </View>
        </View>

        <View style={styles.amountCard}>
          <ThemedText style={styles.cardTitle}>Amount</ThemedText>
          <View style={styles.amountInputRow}>
            <ThemedText style={styles.currencyPrefix}>KES</ThemedText>
            <TextInput
              value={amount}
              onChangeText={(value) => {
                setAmount(value.replace(/[^0-9,]/g, ''));
              }}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="#a0a6ad"
              style={styles.amountInput}
            />
          </View>

          <View style={styles.quickAmounts}>
            {paymentOptions.map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={`Set payment amount to ${formatKes(value)}`}
                onPress={() => {
                  setAmount(value.toLocaleString('en-KE'));
                }}
                style={({ pressed }) => [styles.amountChip, pressed && styles.pressed]}>
                <ThemedText style={styles.amountChipText}>
                  {value === balance ? 'Full balance' : formatKes(value)}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <AppButton
            label={`Confirm ${amountValue > 0 ? formatKes(amountValue) : ''}`.trim()}
            icon={CreditCardIcon}
            color={GREEN_BRIGHT}
            fullWidth
            disabled={amountValue <= 0}
            onPress={handlePay}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function DetailCell({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Landmark;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailCell}>
      <Icon size={15} color={GREEN_DARK} strokeWidth={2.3} />
      <View style={styles.detailCopy}>
        <ThemedText style={styles.detailLabel}>{label}</ThemedText>
        <ThemedText style={styles.detailValue}>{value}</ThemedText>
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
  loanCard: {
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
  loanHeader: {
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
  loanCopy: {
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
  balanceRow: {
    gap: 3,
  },
  balanceLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_MUTED,
  },
  balanceValue: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  sourceCard: {
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
  paybillPanel: {
    minHeight: 70,
    borderRadius: 12,
    backgroundColor: '#f6f8f7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  paybillIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eefaf3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paybillCopy: {
    minWidth: 0,
    flex: 1,
  },
  paybillTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },
  paybillMeta: {
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_MUTED,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  detailCell: {
    flex: 1,
    minWidth: 0,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#edf0ee',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
  },
  detailCopy: {
    minWidth: 0,
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    lineHeight: 13,
    color: TEXT_MUTED,
  },
  detailValue: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  amountCard: {
    borderRadius: 14,
    backgroundColor: SURFACE,
    padding: Spacing.three,
    gap: Spacing.three,
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
  pressed: {
    opacity: 0.72,
  },
});
