import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Spacing } from '@/constants/theme';
import { useUserStore } from '@/store/user-store';

function formatKes(amount: number | undefined): string {
  if (amount == null) return 'KSH. —';
  return `KSH. ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function BalanceSummary() {
  const user = useUserStore((s) => s.user);
  const business = user?.currentBusiness;

  const paybillLabel = business
    ? `${business.shortCodeType.charAt(0).toUpperCase() + business.shortCodeType.slice(1)} - ${business.shortCode}`
    : '—';

  return (
    <View style={styles.summary}>
      <ThemedText themeColor="textSecondary" style={styles.paybill}>
        {paybillLabel}
      </ThemedText>

      <ThemedText style={styles.balance}>{formatKes(business?.shortcodeBalance)}</ThemedText>

      <View style={styles.loanLimit}>
        <ThemedText themeColor="textSecondary" style={styles.loanLimitText}>
          Loan Limit {formatKes(business?.shortcodeLoanLimit)}
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
