import { PhoneCall } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/home/icon-button';
import { PageHeader } from '@/components/page-header';
import { BottomTabInset, Colors, Spacing } from '@/constants/theme';
import { useSaleStore } from '@/store/sale-store';

const TAX_RATE = 0.01;
const PROMPT_SECONDS = 24;

function formatKes(amount: number) {
  return `KES ${amount.toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function MpesaPromptScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const currentSale = useSaleStore((state) => state.currentSale);
  const [secondsLeft, setSecondsLeft] = useState(PROMPT_SECONDS);

  const subtotal = currentSale.amountPaid;
  const tax = useMemo(() => Math.round(subtotal * TAX_RATE), [subtotal]);
  const total = subtotal + tax;
  const phoneNumber = phone || 'your phone';

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

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
          <Text style={styles.countdown}>{secondsLeft}s left</Text>

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
