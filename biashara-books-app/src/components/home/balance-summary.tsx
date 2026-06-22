import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Spacing } from '@/constants/theme';

export function BalanceSummary() {
  return (
    <View style={styles.summary}>
      <ThemedText themeColor="textSecondary" style={styles.paybill}>
        Paybill - 711 6791
      </ThemedText>

      <ThemedText style={styles.balance}>KSH. 141,941.11</ThemedText>

      <View style={styles.loanLimit}>
        <ThemedText themeColor="textSecondary" style={styles.loanLimitText}>
          Loan Limit KES 3,000,000
        </ThemedText>
        <View style={styles.applyAction}>
          <ThemedText type="linkPrimary" style={styles.applyLink}>
            Apply
          </ThemedText>
          <AppIcon name="apply" size={11} color="#007aff" strokeWidth={2.2} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    alignItems: 'center',
    gap: 6,
    paddingTop: Spacing.one,
  },
  paybill: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 400,
  },
  balance: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 600,
    textAlign: 'center',
  },
  loanLimit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  loanLimitText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 400,
  },
  applyLink: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 500,
  },
  applyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
