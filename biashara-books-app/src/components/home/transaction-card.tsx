import { StyleSheet, View } from 'react-native';

import type { Transaction } from '@/components/home/home-data';
import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Spacing } from '@/constants/theme';

type TransactionCardProps = {
  transaction: Transaction;
};

export function TransactionCard({ transaction }: TransactionCardProps) {
  const indicatorColor = transaction.type === 'incoming' ? '#2fc66f' : '#ff2d62';
  const indicatorIcon = transaction.type === 'incoming' ? 'transactionIn' : 'transactionOut';

  return (
    <View style={styles.card}>
      <View style={[styles.indicator, { backgroundColor: indicatorColor }]}>
        <AppIcon name={indicatorIcon} size={18} color="#ffffff" strokeWidth={2.2} />
      </View>

      <View style={styles.body}>
        <View style={styles.primaryRow}>
          <View style={styles.customerBlock}>
            <ThemedText style={styles.customer} numberOfLines={1}>
              {transaction.customer}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.purpose} numberOfLines={1}>
              {transaction.purpose}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.date}>
              {transaction.date}
            </ThemedText>
          </View>

          <View style={styles.amountBlock}>
            <ThemedText style={styles.amount}>{transaction.amount}</ThemedText>
            <ThemedText style={styles.status}>{transaction.status}</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  indicator: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    minWidth: 0,
    flex: 1,
  },
  primaryRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  customerBlock: {
    minWidth: 0,
    flex: 1,
    gap: 3,
  },
  customer: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: 500,
  },
  purpose: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: 600,
  },
  date: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: 500,
  },
  amountBlock: {
    alignItems: 'flex-end',
    gap: 8,
  },
  amount: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: 500,
    textAlign: 'right',
  },
  status: {
    color: '#19b45b',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: 500,
  },
});
