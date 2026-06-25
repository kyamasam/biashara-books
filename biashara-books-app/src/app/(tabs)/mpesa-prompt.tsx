import { PhoneCall } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/home/icon-button';
import { PageHeader } from '@/components/page-header';
import { BottomTabInset, Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { authGet } from '@/lib/api';
import { useSaleStore } from '@/store/sale-store';

const TAX_RATE = 0.01;
const PROMPT_SECONDS = 24;
const POLL_TIMEOUT_MS = 90_000;

function formatKes(amount: number) {
  return `KES ${amount.toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function MpesaPromptScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { accessToken } = useAuth();
  const { phone, saleId } = useLocalSearchParams<{ phone?: string; saleId?: string }>();
  const currentSale = useSaleStore((state) => state.currentSale);
  const [secondsLeft, setSecondsLeft] = useState(PROMPT_SECONDS);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subtotal = currentSale.amountPaid;
  const tax = useMemo(() => Math.round(subtotal * TAX_RATE), [subtotal]);
  const total = subtotal + tax;
  const phoneNumber = phone || 'your phone';

  // countdown — visual only, does not control polling
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => Math.max(s - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  // polling — independent of countdown, runs until completed/failed or 90s hard stop
  useEffect(() => {
    if (!saleId || !accessToken) return;

    function stopPolling() {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    }

    pollingRef.current = setInterval(async () => {
      try {
        console.log('[mpesa-prompt] polling saleId:', saleId);
        const response = await authGet<{ data: { saleStatus: string } }>(
          `/api/sales/${saleId}`,
          accessToken,
        );
        console.log('[mpesa-prompt] poll response:', JSON.stringify(response));
        const status = response.data.saleStatus;
        console.log('[mpesa-prompt] saleStatus:', status);
        if (status === 'completed') {
          console.log('[mpesa-prompt] payment completed, navigating');
          stopPolling();
          router.replace('/payment-complete');
        } else if (status === 'failed') {
          console.log('[mpesa-prompt] payment failed, showing alert');
          stopPolling();
          Alert.alert('Payment Failed', 'The M-Pesa payment was not completed. Please try again.', [
            { text: 'OK', onPress: () => router.replace('/payment') },
          ]);
        }
      } catch (err) {
        console.warn('[mpesa-prompt] poll error:', err);
      }
    }, 3000);

    pollTimeoutRef.current = setTimeout(() => {
      stopPolling();
      setPollTimedOut(true);
    }, POLL_TIMEOUT_MS);

    return stopPolling;
  }, [saleId, accessToken, router]);

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.two }]}>
        <PageHeader
          title="Payment"
          showBack
          onBack={() => router.replace('/payment')}
          actions={
            <View style={styles.headerActions}>
              <IconButton name="qr" accessibilityLabel="Scan QR code" />
              <IconButton name="notifications" accessibilityLabel="Notifications" badge />
            </View>
          }
        />
      </View>

      <View
        style={[
          styles.content,
          {
            paddingBottom: insets.bottom + BottomTabInset + Spacing.five,
          },
        ]}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatKes(total)}</Text>
          </View>
        </View>

        <View style={styles.promptContent}>
          <View style={styles.iconHalo}>
            <View style={styles.iconCircle}>
              <PhoneCall size={52} color="#FFFFFF" strokeWidth={2.4} />
            </View>
          </View>

          <Text style={styles.title}>Check Your Phone</Text>
          <Text style={styles.message}>
            Enter your M-Pesa pin on <Text style={styles.bold}>{phoneNumber}</Text> to authorize{' '}
            <Text style={styles.bold}>{formatKes(total)}</Text>
          </Text>
          {pollTimedOut ? (
            <Text style={styles.timedOut}>Payment timed out. Please try again.</Text>
          ) : secondsLeft > 0 ? (
            <Text style={styles.countdown}>{secondsLeft}s left</Text>
          ) : (
            <Text style={styles.countdown}>Waiting for confirmation…</Text>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.replace('/payment')}
            style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel Payment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },
  topBar: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    gap: Spacing.five,
  },
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    paddingTop: Spacing.three,
  },
  cardTitle: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E2E2',
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.three,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  totalLabel: {
    color: Colors.light.textSecondary,
    fontSize: 16,
    fontWeight: '800',
  },
  totalValue: {
    color: Colors.light.text,
    fontSize: 17,
    fontWeight: '800',
  },
  promptContent: {
    alignItems: 'center',
    gap: Spacing.four,
  },
  iconHalo: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: '#DDF8E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: '#3AC177',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.light.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    color: Colors.light.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    maxWidth: 340,
    textAlign: 'center',
  },
  bold: {
    color: Colors.light.text,
    fontWeight: '800',
  },
  countdown: {
    color: '#2FC56D',
    fontSize: 24,
    fontWeight: '800',
  },
  timedOut: {
    color: Colors.light.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 280,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 24,
    paddingHorizontal: Spacing.four,
    paddingVertical: 12,
  },
  cancelText: {
    color: Colors.light.textSecondary,
    fontSize: 16,
    fontWeight: '800',
  },
});
