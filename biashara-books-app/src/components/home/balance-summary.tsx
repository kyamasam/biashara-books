import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useUserStore } from '@/store/user-store';

function formatKes(amount: number | undefined): string {
  if (amount == null) return 'KSH. —';
  return `KSH. ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function BalanceSummary() {
  const { accessToken } = useAuth();
  const { showError, showSuccess } = useToast();
  const user = useUserStore((s) => s.user);
  const isRefreshingBalance = useUserStore((s) => s.isRefreshingBalance);
  const refreshBalance = useUserStore((s) => s.refreshBalance);
  const business = user?.currentBusiness;

  const paybillLabel = business
    ? `${business.shortCodeType.charAt(0).toUpperCase() + business.shortCodeType.slice(1)} - ${business.shortCode}`
    : '—';

  const handleRefreshBalance = async () => {
    if (!accessToken) {
      showError('Please log in to refresh your balance');
      return;
    }

    try {
      await refreshBalance(accessToken);
      showSuccess('Balance refreshed');
    } catch (error: any) {
      showError(error?.message ?? 'Could not refresh balance');
    }
  };

  return (
    <View style={styles.summary}>
      <ThemedText themeColor="textSecondary" style={styles.paybill}>
        {paybillLabel}
      </ThemedText>

      <View style={styles.balanceRow}>
        <ThemedText style={styles.balance}>{formatKes(business?.shortcodeBalance)}</ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh balance"
          disabled={isRefreshingBalance}
          onPress={handleRefreshBalance}
          style={({ pressed }) => [
            styles.refreshButton,
            (pressed || isRefreshingBalance) && styles.refreshButtonPressed,
          ]}>
          <AppIcon name="refresh" size={18} color="#8E8E93" strokeWidth={2.4} />
        </Pressable>
      </View>

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
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  refreshButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonPressed: {
    opacity: 0.65,
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
