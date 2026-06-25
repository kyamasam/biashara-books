import { ArrowRight, Check, XCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/home/icon-button';
import { PageHeader } from '@/components/page-header';
import { PRIMARY_BUTTON_COLOR } from '@/components/ui/button';
import { BottomTabInset, BrandColors, Colors, Spacing } from '@/constants/theme';
import { useSaleStore } from '@/store/sale-store';
import { useUserStore } from '@/store/user-store';

const TAX_RATE = 0.01;

type PaymentMethod = 'mpesa' | 'cash';

function formatKes(amount: number) {
  return `KES ${amount.toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatPhone(phoneCode?: string, phoneNumber?: string) {
  const code = phoneCode?.trim();
  const number = phoneNumber?.trim();

  if (!number) return '';
  if (!code) return number;

  return `${code.startsWith('+') ? code : `+${code}`} ${number}`;
}

function formatNumberInput(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  return Number(digits).toLocaleString('en-KE', {
    maximumFractionDigits: 0,
  });
}

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const currentSale = useSaleStore((state) => state.currentSale);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [phone, setPhone] = useState(() => formatPhone(user?.phoneCode, user?.phoneNumber));
  const [cashAmount, setCashAmount] = useState('');

  const subtotal = currentSale.amountPaid;
  const tax = useMemo(() => Math.round(subtotal * TAX_RATE), [subtotal]);
  const total = subtotal + tax;
  const isMpesa = paymentMethod === 'mpesa';
  const cashTendered = Number(cashAmount.replace(/,/g, '')) || 0;
  const change = Math.max(cashTendered - total, 0);
  const canProceed = isMpesa ? phone.trim().length > 0 : cashTendered >= total;

  function handleCashAmountChange(value: string) {
    setCashAmount(formatNumberInput(value));
  }

  function handleProceed() {
    if (isMpesa) {
      router.push({ pathname: '/mpesa-prompt', params: { phone: phone.replace(/\s/g, '') } });
      return;
    }

    router.push('/payment-complete');
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.two }]}>
        <PageHeader
          title="Complete Payment"
          showBack
          onBack={() => router.replace('/checkout')}
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

        <View style={styles.segmented}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPaymentMethod('mpesa')}
            style={[styles.segment, isMpesa && styles.segmentSelected]}>
            {isMpesa ? <Check size={17} color={BrandColors.primary} strokeWidth={2.8} /> : null}
            <Text style={[styles.segmentText, isMpesa && styles.segmentTextSelected]}>M-Pesa</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPaymentMethod('cash')}
            style={[styles.segment, !isMpesa && styles.segmentSelected]}>
            {!isMpesa ? <Check size={17} color={BrandColors.primary} strokeWidth={2.8} /> : null}
            <Text style={[styles.segmentText, !isMpesa && styles.segmentTextSelected]}>Cash</Text>
          </Pressable>
        </View>

        {isMpesa ? (
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="+254 700000000"
                placeholderTextColor={Colors.light.textSecondary}
                style={styles.input}
              />
              {phone ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear phone number"
                  onPress={() => setPhone('')}
                  style={styles.clearButton}>
                  <XCircle size={24} color={Colors.light.textSecondary} strokeWidth={2.3} />
                </Pressable>
              ) : null}
            </View>
            <Text style={styles.helperText}>Mpesa Number</Text>
          </View>
        ) : (
          <View style={styles.cashSection}>
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Cash Amount</Text>
                <TextInput
                  value={cashAmount}
                  onChangeText={handleCashAmountChange}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.light.textSecondary}
                  style={styles.input}
                />
                {cashAmount ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Clear cash amount"
                    onPress={() => setCashAmount('')}
                    style={styles.clearButton}>
                    <XCircle size={22} color={Colors.light.textSecondary} strokeWidth={2.2} />
                  </Pressable>
                ) : null}
              </View>
              <Text style={styles.helperText}>Cash Tendered</Text>
            </View>

            <View style={styles.changeRow}>
              <Text style={styles.changeLabel}>Change</Text>
              <Text style={styles.changeValue}>{formatKes(change)}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={handleProceed}
          activeOpacity={0.85}
          disabled={!canProceed}
          style={[
            styles.proceedButton,
            !canProceed && styles.proceedButtonDisabled,
          ]}>
          <Text style={styles.proceedText}>Proceed</Text>
          <ArrowRight size={22} color="#FFFFFF" strokeWidth={2.6} />
        </TouchableOpacity>
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
    gap: Spacing.three,
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
  segmented: {
    borderWidth: 1,
    borderColor: '#D8DDE0',
    borderRadius: 24,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: Colors.light.background,
  },
  segment: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  segmentSelected: {
    backgroundColor: '#E8F7EE',
  },
  segmentText: {
    color: Colors.light.text,
    fontSize: 15,
    fontWeight: '700',
  },
  segmentTextSelected: {
    color: Colors.light.text,
  },
  inputGroup: {
    gap: Spacing.two,
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#D8DDE0',
    borderRadius: 4,
    minHeight: 64,
    justifyContent: 'center',
    paddingLeft: Spacing.three,
    paddingRight: 48,
  },
  inputLabel: {
    backgroundColor: '#F7F7F8',
    color: Colors.light.textSecondary,
    fontSize: 13,
    left: Spacing.two,
    paddingHorizontal: Spacing.one,
    position: 'absolute',
    top: -10,
  },
  input: {
    color: Colors.light.text,
    fontSize: 18,
    fontWeight: '500',
    padding: 0,
  },
  clearButton: {
    position: 'absolute',
    right: Spacing.three,
    top: 20,
  },
  helperText: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    marginLeft: Spacing.three,
  },
  cashSection: {
    gap: Spacing.three,
  },
  changeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  changeLabel: {
    color: Colors.light.textSecondary,
    fontSize: 16,
    fontWeight: '800',
  },
  changeValue: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '800',
  },
  proceedButton: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: PRIMARY_BUTTON_COLOR,
    borderRadius: 14,
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
  },
  proceedButtonDisabled: {
    opacity: 0.5,
  },
  proceedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
