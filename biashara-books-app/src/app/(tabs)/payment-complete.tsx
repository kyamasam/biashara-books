import { Check, Mail, Printer, UserPlus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/home/icon-button';
import { AppButton } from '@/components/ui/button';
import { BottomTabInset, Colors, Spacing } from '@/constants/theme';
import { useSaleStore } from '@/store/sale-store';
import { useUserStore } from '@/store/user-store';

const TAX_RATE = 0.01;

function formatKes(amount: number) {
  return `KES ${amount.toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatDate(date: Date) {
  return date.toLocaleString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function shortRef(id: string) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

export default function PaymentCompleteScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const currentSale = useSaleStore((state) => state.currentSale);
  const clearCurrentSale = useSaleStore((state) => state.clearCurrentSale);
  const user = useUserStore((state) => state.user);

  const subtotal = currentSale.amountPaid;
  const tax = useMemo(() => Math.round(subtotal * TAX_RATE), [subtotal]);
  const total = subtotal + tax;
  const ref = shortRef(currentSale.transactionId);
  const business = user?.currentBusiness;

  function handleNewSale() {
    clearCurrentSale();
    router.replace('/sale');
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.two }]}>
        <View style={styles.headerActions}>
          <IconButton name="qr" accessibilityLabel="Scan QR code" />
          <IconButton name="notifications" accessibilityLabel="Notifications" badge />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: insets.bottom + BottomTabInset + Spacing.five,
          },
        ]}>
        <View style={styles.iconHalo}>
          <View style={styles.iconCircle}>
            <Check size={66} color="#FFFFFF" strokeWidth={2.4} />
          </View>
        </View>

        <Text style={styles.title}>Payment Successful</Text>
        <Text style={styles.amount}>{formatKes(total)}</Text>
        <Text style={styles.subtitle}>
          Paid via {business?.shortCodeType || 'cash'} {business?.shortCode || ''}
        </Text>

        <View style={styles.receipt}>
          <ReceiptRow label="Confirmation Code" value={ref} />
          <ReceiptRow label="Paid To" value={business?.name || 'Business'} />
          <ReceiptRow label="Purpose" value="Sale payment" />
          <ReceiptRow label="Date" value={formatDate(new Date())} />
          <ReceiptRow label="Ref" value={`#${ref}`} last />
        </View>

        <View style={styles.quickActions}>
          <QuickAction icon={Printer} label="Print" />
          <QuickAction icon={UserPlus} label="Create Customer" />
          <QuickAction icon={Mail} label="Email" />
        </View>

        <View style={styles.actions}>
          <AppButton label="Done" fullWidth onPress={handleNewSale} />
          <TouchableOpacity activeOpacity={0.75} onPress={handleNewSale} style={styles.newSaleButton}>
            <Text style={styles.newSaleText}>New Sale</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function ReceiptRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.receiptRow, last && styles.receiptRowLast]}>
      <Text style={styles.receiptLabel}>{label}</Text>
      <Text style={styles.receiptValue}>{value}</Text>
    </View>
  );
}

function QuickAction({
  icon: Icon,
  label,
}: {
  icon: typeof Printer;
  label: string;
}) {
  return (
    <TouchableOpacity activeOpacity={0.75} style={styles.quickAction}>
      <Icon size={24} color={Colors.light.textSecondary} strokeWidth={2.2} />
      <Text style={styles.quickActionText}>{label}</Text>
    </TouchableOpacity>
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.two,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    gap: Spacing.three,
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
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  amount: {
    color: '#0A8153',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  receipt: {
    alignSelf: 'stretch',
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  receiptRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: 14,
  },
  receiptRowLast: {
    borderBottomWidth: 0,
  },
  receiptLabel: {
    color: Colors.light.textSecondary,
    fontSize: 13,
  },
  receiptValue: {
    color: Colors.light.text,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  quickActions: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 14,
    gap: Spacing.two,
    minHeight: 82,
    justifyContent: 'center',
    padding: Spacing.two,
  },
  quickActionText: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  newSaleButton: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  newSaleText: {
    color: Colors.light.text,
    fontSize: 17,
    fontWeight: '800',
  },
});
