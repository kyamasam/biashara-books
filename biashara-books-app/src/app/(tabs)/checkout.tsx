import { ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/home/icon-button';
import { PageHeader } from '@/components/page-header';
import { PRIMARY_BUTTON_COLOR } from '@/components/ui/button';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useSaleStore } from '@/store/sale-store';

const TAX_RATE = 0.01;

function formatKes(amount: number) {
  return `KES ${amount.toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const checkoutItems = useSaleStore((state) => state.checkoutItems);
  const currentSale = useSaleStore((state) => state.currentSale);

  const subtotal = currentSale.amountPaid;
  const tax = useMemo(() => Math.round(subtotal * TAX_RATE), [subtotal]);
  const total = subtotal + tax;

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.two }]}>
        <PageHeader
          title="Checkout"
          showBack
          onBack={() => router.replace('/sale')}
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
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatKes(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>{formatKes(tax)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatKes(total)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.itemCell]}>Item</Text>
            <Text style={[styles.headerCell, styles.unitCell]}>Unit Price</Text>
            <Text style={[styles.headerCell, styles.priceCell]}>Price</Text>
          </View>

          {checkoutItems.length > 0 ? (
            checkoutItems.map((item) => (
              <View key={item.productId} style={styles.tableRow}>
                <Text style={[styles.rowCell, styles.itemCell]} numberOfLines={1}>
                  {item.quantity} {item.name}
                </Text>
                <Text style={[styles.rowCell, styles.unitCell]}>
                  {item.unitPrice.toLocaleString('en-KE')}
                </Text>
                <Text style={[styles.priceText, styles.priceCell]}>{formatKes(item.lineTotal)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No items selected.</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => router.push('/payment')}
          activeOpacity={0.85}
          disabled={checkoutItems.length === 0}
          style={[styles.proceedButton, checkoutItems.length === 0 && styles.proceedButtonDisabled]}>
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    paddingTop: Spacing.three,
  },
  cardTitle: {
    color: '#1F1F1F',
    fontSize: 17,
    fontWeight: '700',
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  summaryLabel: {
    color: '#6A6A6A',
    fontSize: 17,
    fontWeight: '500',
  },
  summaryValue: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E2E2',
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.three,
  },
  totalLabel: {
    color: '#6A6A6A',
    fontSize: 18,
    fontWeight: '800',
  },
  totalValue: {
    color: '#000000',
    fontSize: 19,
    fontWeight: '800',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  headerCell: {
    color: '#686868',
    fontSize: 16,
    fontWeight: '800',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
  },
  rowCell: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  itemCell: {
    flex: 1.3,
  },
  unitCell: {
    flex: 0.9,
    textAlign: 'center',
  },
  priceCell: {
    flex: 1,
    textAlign: 'right',
  },
  priceText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    color: '#777777',
    fontSize: 15,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  proceedButton: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: PRIMARY_BUTTON_COLOR,
    borderRadius: 14,
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
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
