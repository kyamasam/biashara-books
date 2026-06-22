import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type TransactionTabsProps = {
  activeTab?: 'transactions' | 'sales';
};

export function TransactionTabs({ activeTab = 'transactions' }: TransactionTabsProps) {
  return (
    <View style={styles.tabs}>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'transactions' }}
        style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}>
        <ThemedText style={[styles.tabText, activeTab === 'transactions' && styles.activeText]}>
          TRANSACTIONS
        </ThemedText>
      </Pressable>

      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'sales' }}
        style={styles.tab}>
        <ThemedText themeColor="textSecondary" style={styles.tabText}>
          SALES
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 4,
  },
  tab: {
    height: 32,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  activeTab: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#c8c8c8',
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 800,
    letterSpacing: 0,
  },
  activeText: {
    color: '#2f2f2f',
  },
});
