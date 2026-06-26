import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { AppButton } from '@/components/ui/button';
import { BrandColors, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useTheme } from '@/hooks/use-theme';
import { authGet, authPost } from '@/lib/api';
import { ApiError } from '@/lib/api-error';

type PaymentMethod = 'cash' | 'mpesa' | 'pochi' | 'till';

type ExpenseType = {
  id: string;
  name: string;
};

type ExpensePayload = {
  expenseTypeId: string;
  otherName?: string;
  expenseAmount: number;
  paymentMethod: PaymentMethod;
  destinationPaybill?: string;
  accountReference?: string;
  remarks?: string;
};

type ExpenseApiResponse = {
  data: {
    id: string;
    expenseStatus?: string;
    b2bConversationId?: string | null;
  };
};

function parseAmount(value: string) {
  return Number(value.replace(/,/g, '')) || 0;
}

function formatNumberInput(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  return Number(digits).toLocaleString('en-KE', {
    maximumFractionDigits: 0,
  });
}

function isDigitalPayment(method: PaymentMethod) {
  return method !== 'cash';
}

function needsAccountReference(method: PaymentMethod) {
  return method === 'mpesa';
}

function getDestinationLabel(method: PaymentMethod) {
  if (method === 'pochi') return 'Pochi Number';
  if (method === 'till') return 'Till Number';
  return 'Destination Paybill';
}

function getSuccessMessage(method: PaymentMethod, conversationId?: string | null) {
  if (!isDigitalPayment(method)) return 'Cash expense recorded.';

  const label = method === 'mpesa' ? 'M-PESA' : method === 'pochi' ? 'Pochi' : 'Till';
  return `${label} payment initiated${conversationId ? `: ${conversationId}` : ''}`;
}

function formatPochiNumber(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.startsWith('254') ? digits : `254${digits}`;
}

export default function NewExpenseScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { accessToken } = useAuth();
  const { showError, showSuccess } = useToast();

  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [selectedExpenseTypeId, setSelectedExpenseTypeId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [expenseName, setExpenseName] = useState('');
  const [amount, setAmount] = useState('');
  const [destinationPaybill, setDestinationPaybill] = useState('');
  const [pochiNumber, setPochiNumber] = useState('');
  const [accountReference, setAccountReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedExpenseType = useMemo(
    () => expenseTypes.find((type) => type.id === selectedExpenseTypeId),
    [expenseTypes, selectedExpenseTypeId],
  );

  useEffect(() => {
    if (!accessToken) return;

    let isMounted = true;
    const token = accessToken;

    async function loadExpenseTypes() {
      setIsLoadingTypes(true);
      try {
        const response = await authGet<{ data: ExpenseType[] }>('/api/expense-types', token);

        if (!isMounted) return;
        setExpenseTypes(response.data);
        setSelectedExpenseTypeId((current) => current || response.data[0]?.id || '');
      } catch {
        if (!isMounted) return;
        showError('Could not load expense types.');
      } finally {
        if (!isMounted) return;
        setIsLoadingTypes(false);
      }
    }

    void loadExpenseTypes();

    return () => {
      isMounted = false;
    };
  }, [accessToken, showError]);

  function validateForm() {
    if (!selectedExpenseTypeId) return 'Choose an expense type.';
    if (parseAmount(amount) <= 0) return 'Enter a valid expense amount.';

    if (isDigitalPayment(paymentMethod)) {
      if (paymentMethod === 'pochi') {
        if (!pochiNumber.trim()) return 'Enter the pochi number.';
      } else if (!destinationPaybill.trim()) {
        return `Enter the ${getDestinationLabel(paymentMethod).toLowerCase()}.`;
      }
      if (needsAccountReference(paymentMethod) && !accountReference.trim()) return 'Enter the account reference.';
      if (!remarks.trim() && !expenseName.trim()) return 'Enter remarks for the payment.';
    }

    return null;
  }

  async function handleSubmitExpense() {
    if (!accessToken) {
      showError('Please log in again.');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      showError(validationError);
      return;
    }

    const payload: ExpensePayload = {
      expenseTypeId: selectedExpenseTypeId,
      otherName: expenseName.trim() || selectedExpenseType?.name,
      expenseAmount: parseAmount(amount),
      paymentMethod,
    };

    if (isDigitalPayment(paymentMethod)) {
      payload.destinationPaybill =
        paymentMethod === 'pochi' ? formatPochiNumber(pochiNumber) : destinationPaybill.trim();
      if (needsAccountReference(paymentMethod)) {
        payload.accountReference = accountReference.trim();
      }
      payload.remarks = remarks.trim() || expenseName.trim() || 'Expense payment';
    }

    setIsSubmitting(true);
    try {
      const response = await authPost<ExpenseApiResponse>('/api/expenses', payload, accessToken);
      const message = getSuccessMessage(paymentMethod, response.data.b2bConversationId);
      showSuccess(message);
      router.replace('/expenses');
    } catch (error) {
      showError(error instanceof ApiError || error instanceof Error ? error.message : 'Could not create expense.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: safeAreaInsets.top + Spacing.three,
          paddingBottom: safeAreaInsets.bottom + Spacing.four,
          paddingLeft: safeAreaInsets.left + Spacing.three,
          paddingRight: safeAreaInsets.right + Spacing.three,
        },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View style={styles.page}>
        <PageHeader title="New Expense" showBack />
        <Text style={styles.subtitle}>Create the expense and payment together</Text>

        <View style={styles.segmented}>
          <PaymentSegment
            label="Paybill"
            selected={paymentMethod === 'mpesa'}
            onPress={() => setPaymentMethod('mpesa')}
          />
          <PaymentSegment
            label="Pochi"
            selected={paymentMethod === 'pochi'}
            onPress={() => setPaymentMethod('pochi')}
          />
          <PaymentSegment
            label="Till"
            selected={paymentMethod === 'till'}
            onPress={() => setPaymentMethod('till')}
          />
          <PaymentSegment
            label="Cash"
            selected={paymentMethod === 'cash'}
            onPress={() => setPaymentMethod('cash')}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Expense Type</Text>
          {isLoadingTypes ? (
            <Text style={styles.helperText}>Loading expense types...</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeChips}>
              {expenseTypes.map((type) => (
                <Pressable
                  key={type.id}
                  accessibilityRole="button"
                  onPress={() => setSelectedExpenseTypeId(type.id)}
                  style={[
                    styles.typeChip,
                    selectedExpenseTypeId === type.id && styles.typeChipSelected,
                  ]}>
                  <Text
                    style={[
                      styles.typeChipText,
                      selectedExpenseTypeId === type.id && styles.typeChipTextSelected,
                    ]}>
                    {type.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        <FormInput
          label="Name or Payee"
          value={expenseName}
          onChangeText={setExpenseName}
          placeholder="e.g. Shop rent"
        />

        {isDigitalPayment(paymentMethod) ? (
          <>
            {paymentMethod === 'pochi' ? (
              <PrefixedPhoneInput
                label={getDestinationLabel(paymentMethod)}
                value={pochiNumber}
                onChangeText={setPochiNumber}
              />
            ) : (
              <FormInput
                label={getDestinationLabel(paymentMethod)}
                value={destinationPaybill}
                onChangeText={setDestinationPaybill}
                placeholder="000200"
                keyboardType="numeric"
              />
            )}
            {needsAccountReference(paymentMethod) ? (
              <FormInput
                label="Account Reference"
                value={accountReference}
                onChangeText={setAccountReference}
                placeholder="INV-001"
                autoCapitalize="characters"
              />
            ) : null}
            <FormInput
              label="Amount"
              value={amount}
              onChangeText={(value) => setAmount(formatNumberInput(value))}
              placeholder="0"
              keyboardType="numeric"
            />
            <FormInput
              label="Remarks"
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Invoice payment"
            />
          </>
        ) : (
          <FormInput
            label="Amount"
            value={amount}
            onChangeText={(value) => setAmount(formatNumberInput(value))}
            placeholder="0"
            keyboardType="numeric"
          />
        )}

        <AppButton
          label={isSubmitting ? 'Saving...' : isDigitalPayment(paymentMethod) ? 'Pay Expense' : 'Save Expense'}
          fullWidth
          disabled={isSubmitting || isLoadingTypes}
          onPress={handleSubmitExpense}
        />
      </View>
    </ScrollView>
  );
}

function PaymentSegment({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.segment, selected && styles.segmentSelected]}>
      {selected ? <Check size={16} color={BrandColors.primary} strokeWidth={2.8} /> : null}
      <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function FormInput({
  label,
  style,
  ...props
}: ComponentProps<typeof TextInput> & {
  label: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={Colors.light.textSecondary}
        style={[styles.input, style]}
      />
    </View>
  );
}

function PrefixedPhoneInput({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.prefixedInput}>
        <Text style={styles.prefixText}>+254</Text>
        <TextInput
          value={value}
          onChangeText={(nextValue) => onChangeText(nextValue.replace(/\D/g, '').slice(0, 9))}
          placeholder="700000000"
          keyboardType="phone-pad"
          placeholderTextColor={Colors.light.textSecondary}
          style={styles.prefixedTextInput}
        />
      </View>
    </View>
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
  subtitle: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    marginTop: -Spacing.two,
  },
  segmented: {
    borderWidth: 1,
    borderColor: '#D8DDE0',
    borderRadius: 24,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: Colors.light.background,
  },
  segment: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  segmentSelected: {
    backgroundColor: '#E8F7EE',
  },
  segmentText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '700',
  },
  segmentTextSelected: {
    color: Colors.light.text,
  },
  field: {
    gap: Spacing.two,
  },
  label: {
    color: Colors.light.text,
    fontSize: 13,
    fontWeight: '800',
  },
  helperText: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#D8DDE0',
    borderRadius: 8,
    color: Colors.light.text,
    fontSize: 15,
    paddingHorizontal: Spacing.three,
    backgroundColor: '#FFFFFF',
  },
  prefixedInput: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#D8DDE0',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  prefixText: {
    alignSelf: 'stretch',
    color: Colors.light.text,
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: Spacing.three,
    textAlignVertical: 'center',
    backgroundColor: '#F0F0F3',
  },
  prefixedTextInput: {
    flex: 1,
    color: Colors.light.text,
    fontSize: 15,
    paddingHorizontal: Spacing.three,
    minHeight: 50,
  },
  typeChips: {
    gap: Spacing.two,
    paddingRight: Spacing.three,
  },
  typeChip: {
    borderWidth: 1,
    borderColor: '#D8DDE0',
    borderRadius: 999,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    backgroundColor: '#FFFFFF',
  },
  typeChipSelected: {
    borderColor: BrandColors.primary,
    backgroundColor: '#E8F7EE',
  },
  typeChipText: {
    color: Colors.light.text,
    fontSize: 13,
    fontWeight: '700',
  },
  typeChipTextSelected: {
    color: BrandColors.primary,
  },
});
