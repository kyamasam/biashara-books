import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, Hash, Landmark, ReceiptText, Send, ShieldCheck } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { authGet, authPost } from '@/lib/api';
import { formatKes, type SystemLoan, type SystemLoanResponse } from '@/types/loan';

const GREEN = '#0a8f55';
const GREEN_DARK = '#087747';
const GREEN_BRIGHT = '#33c976';
const TEXT_MUTED = '#62676f';
const SURFACE = '#ffffff';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 90_000;

type B2BResponse = {
  id: number;
  status: string;
  conversation_id: string;
  mpesa_code: string;
  is_success: boolean;
};

type B2BStatusResponse = {
  count: number;
  results: Array<{
    transaction_status: string;
    transaction_confirmation_number: string;
  }>;
};

export default function LoanPaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { accessToken } = useAuth();

  const [loan, setLoan] = useState<SystemLoan | null>(null);
  const [loadingLoan, setLoadingLoan] = useState(true);

  const [paybill, setPaybill] = useState('');
  const [accountRef, setAccountRef] = useState('');
  const [amount, setAmount] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [pollTimedOut, setPollTimedOut] = useState(false);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!accessToken || !id) return;
    authGet<SystemLoanResponse>(`/api/loans/system/${id}`, accessToken)
      .then((res) => {
        setLoan(res.data);
        setAmount(String(res.data.monthlyRepaymentAmount));
        setAccountRef(`LOAN-${res.data.id.slice(0, 8).toUpperCase()}`);
      })
      .catch(() => {})
      .finally(() => setLoadingLoan(false));
  }, [accessToken, id]);

  useEffect(() => {
    if (!conversationId || !accessToken) return;

    function stopPolling() {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      pollingRef.current = null;
      timeoutRef.current = null;
    }

    pollingRef.current = setInterval(async () => {
      try {
        const res = await authGet<B2BStatusResponse>(
          `/api/b2b/status?conversation_id=${conversationId}`,
          accessToken,
        );
        const result = res.results?.[0];
        if (!result) return;

        if (result.transaction_status === 'processed') {
          stopPolling();
          router.replace({
            pathname: '/loan/[id]/success',
            params: {
              id: id ?? '',
              amount: amount,
              institutionName: loan?.institutionName ?? '',
              mpesaCode: result.transaction_confirmation_number ?? '',
            },
          });
        } else if (result.transaction_status === 'failed') {
          stopPolling();
          setProcessing(false);
          setSubmitting(false);
          Alert.alert('Payment Failed', 'The B2B payment was not completed. Please try again.');
        }
      } catch (_) {}
    }, POLL_INTERVAL_MS);

    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setProcessing(false);
      setSubmitting(false);
      setPollTimedOut(true);
    }, POLL_TIMEOUT_MS);

    return stopPolling;
  }, [conversationId, accessToken, id, amount, loan, router]);

  async function handlePay() {
    const amountValue = Number(amount.replace(/,/g, ''));
    if (!paybill.trim()) {
      Alert.alert('Missing field', 'Please enter the destination paybill number.');
      return;
    }
    if (!accountRef.trim()) {
      Alert.alert('Missing field', 'Please enter an account reference.');
      return;
    }
    if (!amountValue || amountValue <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }
    if (!accessToken) return;

    setSubmitting(true);
    try {
      const res = await authPost<B2BResponse>('/api/b2b/pay', {
        destination_paybill: paybill.trim(),
        account_reference: accountRef.trim().slice(0, 13),
        amount: amountValue,
        remarks: `Loan repayment to ${loan?.institutionName ?? 'lender'}`,
      }, accessToken);

      setConversationId(res.conversation_id);
      setProcessing(true);
    } catch (err: any) {
      setSubmitting(false);
      Alert.alert('Payment Error', err?.message ?? 'Failed to initiate payment. Please try again.');
    }
  }

  if (loadingLoan) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <PageHeader title="Pay Loan" showBack onBack={() => router.back()} />
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  if (!loan) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <PageHeader title="Pay Loan" showBack onBack={() => router.back()} />
        <ThemedText style={styles.errorText}>This loan could not be found.</ThemedText>
      </View>
    );
  }

  if (processing) {
    return (
      <View style={[styles.processingScreen, { backgroundColor: theme.background }]}>
        <View style={styles.processingCard}>
          <View style={styles.processingIconHalo}>
            <View style={styles.processingIconCircle}>
              <Send size={40} color="#ffffff" strokeWidth={2.4} />
            </View>
          </View>
          <ThemedText style={styles.processingTitle}>Processing Payment</ThemedText>
          <ThemedText style={styles.processingSubtitle}>
            Sending {formatKes(Number(amount))} to {loan.institutionName} via paybill {paybill}
          </ThemedText>
          {pollTimedOut ? (
            <ThemedText style={styles.timedOutText}>
              Payment is taking longer than expected. Check back later.
            </ThemedText>
          ) : (
            <ActivityIndicator size="large" color={GREEN_BRIGHT} style={{ marginTop: Spacing.two }} />
          )}
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setProcessing(false);
              setSubmitting(false);
              setConversationId(null);
            }}
            style={styles.cancelButton}>
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  const amountValue = Number(amount.replace(/,/g, '')) || 0;
  const balance = loan.loanBalance;
  const quickAmounts = [
    loan.monthlyRepaymentAmount,
    Math.min(balance, loan.monthlyRepaymentAmount * 2),
    balance,
  ].filter((v, i, arr) => v > 0 && arr.indexOf(v) === i);

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
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <View style={styles.page}>
        <PageHeader title="Pay via M-Pesa B2B" showBack />

        <View style={styles.loanCard}>
          <ThemedText style={styles.provider}>{loan.institutionName}</ThemedText>
          <View style={styles.balanceRow}>
            <ThemedText style={styles.balanceLabel}>Outstanding balance</ThemedText>
            <ThemedText style={styles.balanceValue}>{formatKes(balance)}</ThemedText>
          </View>
        </View>

        <View style={styles.sourceCard}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Destination paybill</ThemedText>
            <View style={styles.secureBadge}>
              <ShieldCheck size={13} color={GREEN_DARK} strokeWidth={2.4} />
              <ThemedText style={styles.secureText}>B2B Secure</ThemedText>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputIcon}>
              <Hash size={18} color={GREEN_DARK} strokeWidth={2.4} />
            </View>
            <TextInput
              value={paybill}
              onChangeText={(v) => setPaybill(v.replace(/\D/g, ''))}
              keyboardType="number-pad"
              placeholder="Paybill number"
              placeholderTextColor="#a0a6ad"
              style={styles.textInput}
            />
          </View>

          <View style={styles.detailGrid}>
            <View style={styles.detailCell}>
              <Landmark size={15} color={GREEN_DARK} strokeWidth={2.3} />
              <View style={styles.detailCopy}>
                <ThemedText style={styles.detailLabel}>Lender</ThemedText>
                <ThemedText style={styles.detailValue}>{loan.institutionName}</ThemedText>
              </View>
            </View>
            <View style={styles.detailCell}>
              <ReceiptText size={15} color={GREEN_DARK} strokeWidth={2.3} />
              <View style={styles.detailCopy}>
                <ThemedText style={styles.detailLabel}>Account ref</ThemedText>
                <TextInput
                  value={accountRef}
                  onChangeText={(v) => setAccountRef(v.slice(0, 13))}
                  placeholder="Ref (≤13 chars)"
                  placeholderTextColor="#a0a6ad"
                  style={styles.refInput}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.amountCard}>
          <ThemedText style={styles.cardTitle}>Amount</ThemedText>
          <View style={styles.amountInputRow}>
            <ThemedText style={styles.currencyPrefix}>KES</ThemedText>
            <TextInput
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="#a0a6ad"
              style={styles.amountInput}
            />
          </View>

          <View style={styles.quickAmounts}>
            {quickAmounts.map((v) => (
              <Pressable
                key={v}
                accessibilityRole="button"
                accessibilityLabel={`Set amount to ${formatKes(v)}`}
                onPress={() => setAmount(String(v))}
                style={({ pressed }) => [styles.amountChip, pressed && styles.pressed]}>
                <ThemedText style={styles.amountChipText}>
                  {v === balance ? 'Full balance' : formatKes(v)}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <AppButton
            label={submitting ? 'Initiating…' : `Pay ${amountValue > 0 ? formatKes(amountValue) : ''}`.trim()}
            icon={CheckCircle2}
            color={GREEN_BRIGHT}
            fullWidth
            disabled={submitting || amountValue <= 0 || !paybill.trim()}
            onPress={handlePay}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  contentContainer: { alignItems: 'center' },
  page: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.three },
  centered: { flex: 1, padding: Spacing.three, gap: Spacing.three },
  errorText: { color: '#b91c1c', fontSize: 14, lineHeight: 20 },

  processingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  processingCard: {
    width: '100%',
    maxWidth: MaxContentWidth,
    borderRadius: 16,
    backgroundColor: SURFACE,
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  processingIconHalo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ddf8e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#33c976',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingTitle: { fontSize: 22, lineHeight: 28, fontWeight: '800', textAlign: 'center' },
  processingSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: TEXT_MUTED,
    textAlign: 'center',
    maxWidth: 300,
  },
  timedOutText: {
    fontSize: 13,
    lineHeight: 18,
    color: TEXT_MUTED,
    textAlign: 'center',
    maxWidth: 280,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 24,
    paddingHorizontal: Spacing.four,
    paddingVertical: 12,
    marginTop: Spacing.two,
  },
  cancelText: { fontSize: 15, fontWeight: '700', color: TEXT_MUTED },

  loanCard: {
    borderRadius: 14,
    backgroundColor: SURFACE,
    padding: Spacing.three,
    gap: Spacing.two,
    shadowColor: '#111827',
    shadowOpacity: 0.025,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  provider: { fontSize: 17, lineHeight: 22, fontWeight: '700' },
  balanceRow: { gap: 3 },
  balanceLabel: { fontSize: 12, lineHeight: 16, color: TEXT_MUTED },
  balanceValue: { fontSize: 26, lineHeight: 32, fontWeight: '800' },

  sourceCard: { borderRadius: 14, backgroundColor: SURFACE, padding: Spacing.three, gap: Spacing.three },
  cardHeader: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  cardTitle: { fontSize: 16, lineHeight: 21, fontWeight: '700' },
  secureBadge: {
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eefaf3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
  },
  secureText: { fontSize: 10, lineHeight: 12, fontWeight: '700', color: GREEN_DARK },

  inputRow: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#f6f8f7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eefaf3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: { flex: 1, fontSize: 16, fontWeight: '700', color: '#111111', paddingVertical: 0 },

  detailGrid: { flexDirection: 'row', gap: Spacing.two },
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
  detailCopy: { minWidth: 0, flex: 1 },
  detailLabel: { fontSize: 10, lineHeight: 13, color: TEXT_MUTED },
  detailValue: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
  refInput: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#111111',
    paddingVertical: 0,
    minWidth: 0,
  },

  amountCard: { borderRadius: 14, backgroundColor: SURFACE, padding: Spacing.three, gap: Spacing.three },
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
  currencyPrefix: { fontSize: 13, lineHeight: 17, fontWeight: '700', color: TEXT_MUTED },
  amountInput: { flex: 1, minWidth: 0, paddingVertical: 0, fontSize: 22, lineHeight: 28, fontWeight: '800', color: '#111111' },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  amountChip: {
    minHeight: 32,
    borderRadius: 16,
    backgroundColor: '#f2f6f3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  amountChipText: { fontSize: 11, lineHeight: 14, fontWeight: '700', color: GREEN_DARK },
  pressed: { opacity: 0.72 },
});
