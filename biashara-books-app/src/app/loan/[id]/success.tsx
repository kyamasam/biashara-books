import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, ReceiptText } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { formatKes, getLoanById } from '@/data/loans';
import { useTheme } from '@/hooks/use-theme';

const GREEN = '#0a8f55';
const GREEN_DARK = '#087747';
const GREEN_BRIGHT = '#33c976';
const TEXT_MUTED = '#62676f';
const SURFACE = '#ffffff';

export default function LoanPaymentSuccessScreen() {
  const { id, amount } = useLocalSearchParams<{ id: string; amount?: string }>();
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const loan = getLoanById(id);
  const amountValue = Number(amount) || loan?.monthlyPayment || 0;

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: safeAreaInsets.top + Spacing.five,
          paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.four,
          paddingLeft: safeAreaInsets.left + Spacing.three,
          paddingRight: safeAreaInsets.right + Spacing.three,
        },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.page}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <CheckCircle2 size={44} color={GREEN} strokeWidth={2.4} />
          </View>

          <ThemedText style={styles.title}>Payment successful</ThemedText>
          <ThemedText style={styles.subtitle}>
            {formatKes(amountValue)} has been sent to {loan?.provider ?? 'your lender'}.
          </ThemedText>

          {loan ? (
            <View style={styles.receiptCard}>
              <View style={styles.loanRow}>
                <View style={styles.logoFrame}>
                  <Image
                    source={loan.logo}
                    style={styles.logo}
                    contentFit="contain"
                    accessibilityLabel={`${loan.provider} logo`}
                  />
                </View>
                <View style={styles.loanCopy}>
                  <ThemedText style={styles.provider}>{loan.provider}</ThemedText>
                  <ThemedText style={styles.account}>{loan.account}</ThemedText>
                </View>
              </View>

              <View style={styles.detailRow}>
                <ReceiptText size={16} color={GREEN_DARK} strokeWidth={2.3} />
                <View style={styles.detailCopy}>
                  <ThemedText style={styles.detailLabel}>Paybill</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {loan.paybill.number} - {loan.paybill.account}
                  </ThemedText>
                </View>
              </View>
            </View>
          ) : null}

          <View style={styles.actions}>
            <AppButton
              label="Done"
              color={GREEN_BRIGHT}
              fullWidth
              onPress={() => router.replace('/loans')}
            />
            {loan ? (
              <AppButton
                label="View loan"
                variant="secondary"
                fullWidth
                onPress={() => router.replace({ pathname: '/loan/[id]', params: { id: loan.id } })}
              />
            ) : null}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    flexGrow: 1,
  },
  page: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flex: 1,
    justifyContent: 'center',
  },
  successCard: {
    borderRadius: 16,
    backgroundColor: SURFACE,
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    shadowColor: '#111827',
    shadowOpacity: 0.025,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  successIcon: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#eefaf3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  receiptCard: {
    alignSelf: 'stretch',
    borderRadius: 12,
    backgroundColor: '#f6f8f7',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  loanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  logoFrame: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#edf0ee',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  loanCopy: {
    minWidth: 0,
    flex: 1,
  },
  provider: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  account: {
    fontSize: 11,
    lineHeight: 15,
    color: TEXT_MUTED,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  detailCopy: {
    minWidth: 0,
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    lineHeight: 13,
    color: TEXT_MUTED,
  },
  detailValue: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: GREEN_DARK,
  },
  actions: {
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
});
