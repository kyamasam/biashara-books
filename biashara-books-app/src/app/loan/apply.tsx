import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { AlertCircle, ArrowUpRight, Check, CheckCircle2, ChevronDown } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useUserStore } from '@/store/user-store';
import { formatKes } from '@/types/loan';

const GREEN = '#0a8f55';
const GREEN_DARK = '#087747';
const GREEN_BRIGHT = '#33c976';
const TEXT_MUTED = '#62676f';
const REPAYMENT_PERIODS = [3, 6, 9, 12];
const LOAN_PURPOSES = [
  'Stock purchase',
  'Business expansion',
  'Equipment purchase',
  'Pay suppliers',
  'Emergency cash flow',
];

type LoanOffer = {
  id: string;
  name: string;
  type: string;
  interestRate: number;
  limit: number;
  logo: number;
};

const LOAN_OFFERS: LoanOffer[] = [
  {
    id: 'kcb',
    name: 'KCB Bank',
    type: 'Business loan',
    interestRate: 12.4,
    limit: 850000,
    logo: require('@/assets/bank-logos/kcb-logo.png'),
  },
  {
    id: 'equity',
    name: 'Equity Bank',
    type: 'Working capital',
    interestRate: 10.8,
    limit: 650000,
    logo: require('@/assets/bank-logos/equity-logo.png'),
  },
  {
    id: 'im-bank',
    name: 'I&M Bank',
    type: 'Merchant advance',
    interestRate: 11.2,
    limit: 720000,
    logo: require('@/assets/bank-logos/inm-bank-logo.png'),
  },
];

const formatAmountInput = (value: string, maxAmount: number) => {
  if (maxAmount <= 0) return '';
  const numericValue = Number(value.replace(/[^0-9]/g, ''));
  if (!numericValue) return '';
  return String(Math.min(numericValue, maxAmount));
};

const estimateMonthlyRepayment = (amount: number, annualRate: number, months: number) => {
  if (!amount || !months) return 0;
  const totalInterest = amount * (annualRate / 100) * (months / 12);
  return Math.ceil((amount + totalInterest) / months);
};

export default function LoanApplyScreen() {
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const user = useUserStore((s) => s.user);
  const loanLimit = user?.currentBusiness?.shortcodeLoanLimit ?? 0;

  const [selectedOfferId, setSelectedOfferId] = useState(LOAN_OFFERS[0].id);
  const [selectedPeriod, setSelectedPeriod] = useState(REPAYMENT_PERIODS[1]);
  const [loanAmount, setLoanAmount] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [purposeOpen, setPurposeOpen] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [submittedKey, setSubmittedKey] = useState<string | null>(null);

  const selectedOffer = LOAN_OFFERS.find((offer) => offer.id === selectedOfferId) ?? LOAN_OFFERS[0];
  const maxLoanAmount = Math.min(loanLimit, selectedOffer.limit);
  const loanAmountValue = Number(loanAmount);
  const monthlyEstimate = useMemo(
    () => estimateMonthlyRepayment(loanAmountValue, selectedOffer.interestRate, selectedPeriod),
    [loanAmountValue, selectedOffer.interestRate, selectedPeriod],
  );
  const applicationReady = loanAmountValue > 0 && loanAmountValue <= maxLoanAmount && Boolean(loanPurpose) && hasConsented;
  const applicationKey = `${selectedOfferId}:${loanAmount}:${selectedPeriod}:${loanPurpose}:${hasConsented}`;
  const submitted = submittedKey === applicationKey;

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: safeAreaInsets.top + Spacing.three,
          paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.four,
          paddingLeft: safeAreaInsets.left + Spacing.three,
          paddingRight: safeAreaInsets.right + Spacing.three,
        },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.page}>
        <PageHeader title="Apply for Loan" showBack onBack={() => router.back()} />

        <View style={styles.limitCard}>
          <ThemedText style={styles.limitLabel}>Available loan limit</ThemedText>
          <ThemedText style={styles.limitValue}>{formatKes(loanLimit)}</ThemedText>
          <ThemedText style={styles.limitMeta}>Select a bank offer below to continue.</ThemedText>
        </View>

        <View style={styles.applicationCard}>
          <View style={styles.sectionHeader}>
            <View>
              <ThemedText style={styles.sectionTitle}>Choose a Bank</ThemedText>
              <ThemedText style={styles.applicationSubtitle}>Compare interest rates and lender limits.</ThemedText>
            </View>
            <View style={styles.availableChip}>
              <ThemedText style={styles.availableChipLabel}>Max</ThemedText>
              <ThemedText style={styles.availableChipValue}>{formatKes(maxLoanAmount)}</ThemedText>
            </View>
          </View>

          <View style={styles.offerList}>
            {LOAN_OFFERS.map((offer) => (
              <LoanOfferRow
                key={offer.id}
                offer={offer}
                selected={offer.id === selectedOfferId}
                onPress={() => {
                  setSelectedOfferId(offer.id);
                  setLoanAmount((currentAmount) => formatAmountInput(currentAmount, Math.min(loanLimit, offer.limit)));
                }}
              />
            ))}
          </View>

          <View style={styles.applicationField}>
            <ThemedText style={styles.fieldLabel}>Loan purpose</ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: purposeOpen }}
              accessibilityLabel="Select loan purpose"
              onPress={() => setPurposeOpen((isOpen) => !isOpen)}
              style={[styles.dropdownButton, purposeOpen && styles.dropdownButtonOpen]}>
              <ThemedText style={[styles.dropdownValue, !loanPurpose && styles.dropdownPlaceholder]}>
                {loanPurpose || 'Select purpose'}
              </ThemedText>
              <ChevronDown size={18} color="#111111" strokeWidth={2.5} />
            </Pressable>
            {purposeOpen ? (
              <View style={styles.dropdownMenu}>
                {LOAN_PURPOSES.map((purpose) => {
                  const selected = loanPurpose === purpose;
                  return (
                    <Pressable
                      key={purpose}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => {
                        setLoanPurpose(purpose);
                        setPurposeOpen(false);
                      }}
                      style={[styles.dropdownOption, selected && styles.dropdownOptionSelected]}>
                      <ThemedText style={[styles.dropdownOptionText, selected && styles.dropdownOptionTextSelected]}>
                        {purpose}
                      </ThemedText>
                      {selected ? <Check size={16} color={GREEN_DARK} strokeWidth={2.6} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>

          <View style={styles.applicationField}>
            <View style={styles.fieldLabelRow}>
              <ThemedText style={styles.fieldLabel}>Loan amount</ThemedText>
              <ThemedText style={styles.fieldHint}>Limit {formatKes(loanLimit)}</ThemedText>
            </View>
            <View style={styles.amountInputWrap}>
              <ThemedText style={styles.amountPrefix}>KES</ThemedText>
              <TextInput
                value={loanAmount}
                onChangeText={(value) => setLoanAmount(formatAmountInput(value, maxLoanAmount))}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="#9ca3af"
                style={styles.amountInput}
              />
            </View>
            {loanLimit <= 0 ? (
              <View style={styles.limitNotice}>
                <AlertCircle size={13} color="#b91c1c" strokeWidth={2.3} />
                <ThemedText style={styles.limitNoticeText}>You do not have an available loan limit yet.</ThemedText>
              </View>
            ) : null}
          </View>

          <View style={styles.applicationField}>
            <ThemedText style={styles.fieldLabel}>Repayment period</ThemedText>
            <View style={styles.periodRow}>
              {REPAYMENT_PERIODS.map((period) => {
                const selected = selectedPeriod === period;
                return (
                  <Pressable
                    key={period}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setSelectedPeriod(period)}
                    style={[styles.periodChip, selected && styles.periodChipSelected]}>
                    <ThemedText style={[styles.periodChipText, selected && styles.periodChipTextSelected]}>
                      {period} mo
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.applicationSummary}>
            <View>
              <ThemedText style={styles.summaryLabel}>Estimated monthly pay</ThemedText>
              <ThemedText style={styles.summaryValue}>{monthlyEstimate ? formatKes(monthlyEstimate) : 'KES 0'}</ThemedText>
            </View>
            <View style={styles.summaryDivider} />
            <View>
              <ThemedText style={styles.summaryLabel}>Selected lender</ThemedText>
              <ThemedText style={styles.summaryValueSmall}>{selectedOffer.name}</ThemedText>
            </View>
          </View>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: hasConsented }}
            accessibilityLabel="Consent for bank to access business history and loan score"
            onPress={() => setHasConsented((checked) => !checked)}
            style={[styles.consentBox, hasConsented && styles.consentBoxChecked]}>
            <View style={[styles.checkbox, hasConsented && styles.checkboxChecked]}>
              {hasConsented ? <Check size={14} color="#ffffff" strokeWidth={2.8} /> : null}
            </View>
            <View style={styles.consentTextWrap}>
              <ThemedText style={styles.consentTitle}>Consent to share business history</ThemedText>
              <ThemedText style={styles.consentText}>
                I allow {selectedOffer.name} to access my Biashara Books sales history, repayment history, and loan score
                for this application.
              </ThemedText>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Submit loan application"
            disabled={!applicationReady}
            onPress={() => setSubmittedKey(applicationKey)}
            style={[styles.submitApplicationButton, !applicationReady && styles.submitApplicationButtonDisabled]}>
            <ThemedText style={styles.submitApplicationText}>Submit application</ThemedText>
            <ArrowUpRight size={17} color="#ffffff" strokeWidth={2.5} />
          </Pressable>

          {submitted ? (
            <View style={styles.submittedNotice}>
              <CheckCircle2 size={14} color={GREEN_DARK} strokeWidth={2.4} />
              <ThemedText style={styles.submittedNoticeText}>
                Application prepared for {selectedOffer.name}. We will notify you once it is reviewed.
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

function LoanOfferRow({
  offer,
  selected,
  onPress,
}: {
  offer: LoanOffer;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${offer.name}, ${offer.interestRate}% interest, limit ${formatKes(offer.limit)}`}
      onPress={onPress}
      style={[styles.offerRow, selected && styles.offerRowSelected]}>
      <View style={styles.offerLogoFrame}>
        <Image source={offer.logo} style={styles.offerLogo} contentFit="contain" transition={120} />
      </View>
      <View style={styles.offerContent}>
        <View style={styles.offerTitleRow}>
          <ThemedText style={styles.offerName}>{offer.name}</ThemedText>
          <ThemedText style={styles.offerRate}>{offer.interestRate}% p.a.</ThemedText>
        </View>
        <View style={styles.offerMetaRow}>
          <ThemedText style={styles.offerMeta}>{offer.type}</ThemedText>
          <ThemedText style={styles.offerLimit}>Limit {formatKes(offer.limit)}</ThemedText>
        </View>
      </View>
      <View style={[styles.offerRadio, selected && styles.offerRadioSelected]}>
        {selected ? <View style={styles.offerRadioDot} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
  },
  page: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  limitCard: {
    borderRadius: 24,
    backgroundColor: GREEN,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  limitLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  limitValue: {
    marginTop: 4,
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '800',
    color: '#ffffff',
  },
  limitMeta: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.86)',
  },
  applicationCard: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: Spacing.three,
    gap: Spacing.three,
    shadowColor: '#111827',
    shadowOpacity: 0.035,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 1,
  },
  sectionHeader: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  applicationSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_MUTED,
  },
  availableChip: {
    minHeight: 38,
    borderRadius: 19,
    backgroundColor: '#eefaf3',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  availableChipLabel: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '700',
    color: GREEN_DARK,
    textTransform: 'uppercase',
  },
  availableChipValue: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
    color: GREEN_DARK,
  },
  offerList: {
    gap: Spacing.two,
  },
  offerRow: {
    minHeight: 68,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#edf0ee',
    backgroundColor: '#fbfcfb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  offerRowSelected: {
    borderColor: GREEN_BRIGHT,
    backgroundColor: '#f2fff7',
  },
  offerLogoFrame: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#edf0ee',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  offerLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  offerContent: {
    minWidth: 0,
    flex: 1,
    gap: 5,
  },
  offerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  offerName: {
    minWidth: 0,
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  offerRate: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    color: GREEN_DARK,
  },
  offerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  offerMeta: {
    flex: 1,
    fontSize: 11,
    lineHeight: 14,
    color: TEXT_MUTED,
  },
  offerLimit: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: TEXT_MUTED,
  },
  offerRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#cfd6d1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerRadioSelected: {
    borderColor: GREEN_DARK,
  },
  offerRadioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: GREEN_DARK,
  },
  applicationField: {
    gap: Spacing.two,
  },
  fieldLabelRow: {
    minHeight: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  fieldLabel: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },
  fieldHint: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  dropdownButton: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e3e7e4',
    backgroundColor: '#fbfcfb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  dropdownButtonOpen: {
    borderColor: GREEN_BRIGHT,
    backgroundColor: '#f2fff7',
  },
  dropdownValue: {
    minWidth: 0,
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  dropdownPlaceholder: {
    color: '#9ca3af',
  },
  dropdownMenu: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e3e7e4',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  dropdownOption: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#edf0ee',
  },
  dropdownOptionSelected: {
    backgroundColor: '#f2fff7',
  },
  dropdownOptionText: {
    minWidth: 0,
    flex: 1,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: TEXT_MUTED,
  },
  dropdownOptionTextSelected: {
    color: GREEN_DARK,
  },
  amountInputWrap: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e3e7e4',
    backgroundColor: '#fbfcfb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  amountPrefix: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    color: GREEN_DARK,
  },
  amountInput: {
    minWidth: 0,
    flex: 1,
    padding: 0,
    color: '#111111',
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '800',
  },
  limitNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  limitNoticeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#b91c1c',
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  periodChip: {
    minWidth: 72,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e3e7e4',
    backgroundColor: '#fbfcfb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  periodChipSelected: {
    borderColor: GREEN_BRIGHT,
    backgroundColor: GREEN,
  },
  periodChipText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    color: TEXT_MUTED,
  },
  periodChipTextSelected: {
    color: '#ffffff',
  },
  applicationSummary: {
    minHeight: 66,
    borderRadius: 14,
    backgroundColor: '#f6f8f7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  summaryLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    color: TEXT_MUTED,
  },
  summaryValue: {
    marginTop: 3,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },
  summaryValueSmall: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },
  summaryDivider: {
    width: 1,
    height: 34,
    backgroundColor: '#e0e5e2',
  },
  consentBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e3e7e4',
    backgroundColor: '#fbfcfb',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  consentBoxChecked: {
    borderColor: GREEN_BRIGHT,
    backgroundColor: '#f2fff7',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#cfd6d1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    borderColor: GREEN_DARK,
    backgroundColor: GREEN_DARK,
  },
  consentTextWrap: {
    minWidth: 0,
    flex: 1,
    gap: 3,
  },
  consentTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },
  consentText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  submitApplicationButton: {
    height: 46,
    borderRadius: 23,
    backgroundColor: GREEN_BRIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  submitApplicationButtonDisabled: {
    opacity: 0.45,
  },
  submitApplicationText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  submittedNotice: {
    borderRadius: 12,
    backgroundColor: '#eefaf3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  submittedNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: GREEN_DARK,
  },
});
