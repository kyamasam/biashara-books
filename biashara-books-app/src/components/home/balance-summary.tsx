import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

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
  const router = useRouter();
  const { accessToken } = useAuth();
  const { showError, showSuccess } = useToast();
  const user = useUserStore((s) => s.user);
  const isRefreshingBalance = useUserStore((s) => s.isRefreshingBalance);
  const refreshBalance = useUserStore((s) => s.refreshBalance);
  const business = user?.currentBusiness;
  const refreshRotation = useSharedValue(0);
  const balancePulse = useSharedValue(1);

  useEffect(() => {
    if (isRefreshingBalance) {
      refreshRotation.value = 0;
      refreshRotation.value = withRepeat(
        withTiming(1, { duration: 800, easing: Easing.linear }),
        -1,
        false,
      );
      balancePulse.value = withRepeat(
        withSequence(
          withTiming(0.94, { duration: 420, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 420, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    } else {
      refreshRotation.value = withTiming(0, { duration: 160, easing: Easing.out(Easing.ease) });
      balancePulse.value = withTiming(1, { duration: 160, easing: Easing.out(Easing.ease) });
    }
  }, [balancePulse, isRefreshingBalance, refreshRotation]);

  const refreshIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${refreshRotation.value * 360}deg` }],
  }));

  const balancePulseStyle = useAnimatedStyle(() => ({
    opacity: balancePulse.value,
    transform: [{ scale: balancePulse.value }],
  }));

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
        {paybillLabel} balance
      </ThemedText>

      <View style={styles.balanceRow}>
        <Animated.View style={balancePulseStyle}>
          <ThemedText style={styles.balance}>{formatKes(business?.shortcodeBalance)}</ThemedText>
        </Animated.View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh balance"
          accessibilityState={{ busy: isRefreshingBalance, disabled: isRefreshingBalance }}
          disabled={isRefreshingBalance}
          onPress={handleRefreshBalance}
          style={({ pressed }) => [
            styles.refreshButton,
            (pressed || isRefreshingBalance) && styles.refreshButtonPressed,
          ]}>
          <Animated.View style={refreshIconStyle}>
            <AppIcon name="refresh" size={18} color="#8E8E93" strokeWidth={2.4} />
          </Animated.View>
        </Pressable>
      </View>

      <View style={styles.loanLimit}>
        <ThemedText themeColor="textSecondary" style={styles.loanLimitText}>
          Loan Limit {formatKes(business?.shortcodeLoanLimit)}
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Apply for loan"
          onPress={() => router.push('/loan/apply')}
          style={[styles.applyAction]}>
          <ThemedText type="linkPrimary" numberOfLines={1} style={styles.applyLink}>
            Apply
          </ThemedText>
          <View style={styles.applyIcon}>
            <AppIcon name="apply" size={11} color="#007aff" strokeWidth={2.2} />
          </View>
        </Pressable>
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
    flexShrink: 0,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 500,
  },
  applyAction: {
    minHeight: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    flexWrap: 'nowrap',
    gap: 2,
  },
  applyIcon: {
    width: 11,
    height: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  applyActionPressed: {
    opacity: 0.65,
  },
});
