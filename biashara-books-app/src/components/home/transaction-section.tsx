import { StyleSheet, View } from 'react-native';

import type { TransactionGroup } from '@/components/home/home-data';
import { TransactionCard } from '@/components/home/transaction-card';
import { ThemedText } from '@/components/themed-text';

type TransactionSectionProps = {
  groups: TransactionGroup[];
};

export function TransactionSection({ groups }: TransactionSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Transactions</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Recent payments and sales
        </ThemedText>
      </View>

      {groups.map((group) => (
        <View key={group.date} style={styles.group}>
          <ThemedText themeColor="textSecondary" style={styles.groupTitle}>
            {group.date}
          </ThemedText>

          <View style={styles.cards}>
            {group.items.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  group: {
    gap: 6,
  },
  groupTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: 700,
  },
  cards: {
    gap: 8,
  },
});
