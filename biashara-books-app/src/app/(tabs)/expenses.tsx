import { Check, XCircle } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExpenseList } from '@/components/expenses/expense-list';
import { ExpensesCategoryFilter } from '@/components/expenses/expenses-category-filter';
import {
  EXPENSE_MONTHS,
  type ExpenseCategoryFilter,
  type ExpenseGroup,
  type Expense,
} from '@/components/expenses/expenses-data';
import { ExpensesPageHeader } from '@/components/expenses/expenses-page-header';
import { ExpensesSectionHeader } from '@/components/expenses/expenses-section-header';
import { ExpensesSummaryCard } from '@/components/expenses/expenses-summary-card';
import { AppButton } from '@/components/ui/button';
import { PeriodSelection } from '@/components/ui/month-dropdown';
import { BottomTabInset, BrandColors, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useTheme } from '@/hooks/use-theme';
import { authGet, authPost } from '@/lib/api';
import { ApiError } from '@/lib/api-error';

type PaymentMethod = 'cash' | 'mpesa';

type ExpenseType = {
  id: string;
  name: string;
};

type ExpensePayload = {
  expenseTypeId: string;
  otherName?: string;
  expenseAmount: number;
  paymentMethod: PaymentMethod;
  sourceAccountId?: number;
  destinationPaybill?: string;
  accountReference?: string;
  remarks?: string;
  requester?: string;
};

type ExpenseApiResponse = {
  data: {
    id: string;
    expenseStatus?: string;
    b2bConversationId?: string | null;
  };
};

type ExpenseRecord = {
  id: string;
  expenseTypeId: string;
  otherName?: string | null;
  expenseAmount: number | string;
  paymentMethod?: PaymentMethod;
  expenseStatus?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
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

function parseApiAmount(amount: number | string) {
  return typeof amount === 'number' ? amount : Number(amount) || 0;
}

function getExpenseDate(expense: ExpenseRecord) {
  return expense.createdAt || expense.updatedAt || new Date().toISOString();
}

function toDateKey(value: string) {
  return value.slice(0, 10);
}

function formatExpenseTime(value: string) {
  return new Date(value).toLocaleTimeString('en-KE', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatGroupLabel(dateKey: string) {
  const today = toDateKey(new Date().toISOString());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = toDateKey(yesterdayDate.toISOString());

  if (dateKey === today) return 'Today';
  if (dateKey === yesterday) return 'Yesterday';

  return new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getPeriodLabel(selection: PeriodSelection) {
  if (selection.type === 'month') return selection.label;

  return `${new Date(`${selection.startDate}T00:00:00`).toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
  })} - ${new Date(`${selection.endDate}T00:00:00`).toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
  })}`;
}

function isInSelectedPeriod(expense: Expense, selection: PeriodSelection) {
  if (selection.type === 'month') return expense.date.startsWith(selection.value);

  return expense.date >= selection.startDate && expense.date <= selection.endDate;
}

function groupExpenses(expenses: Expense[]): ExpenseGroup[] {
  const groups = new Map<string, Expense[]>();

  for (const expense of expenses) {
    const current = groups.get(expense.date) ?? [];
    current.push(expense);
    groups.set(expense.date, current);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      label: formatGroupLabel(date),
      date,
      total: items.reduce((sum, expense) => sum + expense.amount, 0),
      items: items.sort((a, b) => b.time.localeCompare(a.time)),
    }));
}

export default function ExpensesScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  const { accessToken } = useAuth();
  const { showError, showSuccess } = useToast();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodSelection>(EXPENSE_MONTHS[5]);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryFilter>('All');
  const [showForm, setShowForm] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [selectedExpenseTypeId, setSelectedExpenseTypeId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [expenseName, setExpenseName] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [destinationPaybill, setDestinationPaybill] = useState('');
  const [accountReference, setAccountReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [requester, setRequester] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);

  const expenseTypeById = useMemo(
    () => new Map(expenseTypes.map((type) => [type.id, type.name])),
    [expenseTypes],
  );

  const mappedExpenses: Expense[] = useMemo(
    () =>
      expenses.map((expense) => {
        const expenseTypeName = expenseTypeById.get(expense.expenseTypeId) ?? 'Expense';
        const createdAt = getExpenseDate(expense);

        return {
          id: expense.id,
          vendor: expense.otherName?.trim() || expenseTypeName,
          category: expenseTypeName,
          expenseTypeId: expense.expenseTypeId,
          categoryLabel: expenseTypeName,
          amount: parseApiAmount(expense.expenseAmount),
          date: toDateKey(createdAt),
          time: formatExpenseTime(createdAt),
        };
      }),
    [expenses, expenseTypeById],
  );

  const activeCategory =
    selectedCategory === 'All' || expenseTypes.some((type) => type.id === selectedCategory)
      ? selectedCategory
      : 'All';

  const filteredExpenses = useMemo(
    () =>
      mappedExpenses.filter((expense) => {
        const matchesPeriod = isInSelectedPeriod(expense, selectedPeriod);
        const matchesType =
          activeCategory === 'All' || expense.expenseTypeId === activeCategory;

        return matchesPeriod && matchesType;
      }),
    [activeCategory, mappedExpenses, selectedPeriod],
  );

  const filteredGroups: ExpenseGroup[] = useMemo(
    () => groupExpenses(filteredExpenses),
    [filteredExpenses],
  );

  const filterOptions = useMemo<ExpenseCategoryFilter[]>(
    () => ['All', ...expenseTypes.map((type) => type.id)],
    [expenseTypes],
  );

  const filterLabels = useMemo(
    () => new Map<ExpenseCategoryFilter, string>([
      ['All', 'All'],
      ...expenseTypes.map((type) => [type.id, type.name] as [ExpenseCategoryFilter, string]),
    ]),
    [expenseTypes],
  );

  const expenseSummary = useMemo(
    () => ({
      month: getPeriodLabel(selectedPeriod),
      totalSpent: filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      pointsEarned: 0,
    }),
    [filteredExpenses, selectedPeriod],
  );

  const selectedExpenseType = useMemo(
    () => expenseTypes.find((type) => type.id === selectedExpenseTypeId),
    [expenseTypes, selectedExpenseTypeId],
  );

  const loadExpenses = useCallback(async () => {
    if (!accessToken) return;

    setIsLoadingExpenses(true);
    try {
      const response = await authGet<{ data: ExpenseRecord[] }>('/api/expenses', accessToken);
      setExpenses(response.data);
    } catch {
      showError('Could not load expenses.');
    } finally {
      setIsLoadingExpenses(false);
    }
  }, [accessToken, showError]);

  useEffect(() => {
    if (!accessToken) return;

    let isMounted = true;
    const token = accessToken;

    async function loadInitialExpenses() {
      setIsLoadingExpenses(true);
      try {
        const [typesResponse, expensesResponse] = await Promise.all([
          authGet<{ data: ExpenseType[] }>('/api/expense-types', token),
          authGet<{ data: ExpenseRecord[] }>('/api/expenses', token),
        ]);

        if (!isMounted) return;
        setExpenseTypes(typesResponse.data);
        setSelectedExpenseTypeId((current) => current || typesResponse.data[0]?.id || '');
        setExpenses(expensesResponse.data);
      } catch {
        if (!isMounted) return;
        showError('Could not load expenses.');
      } finally {
        if (!isMounted) return;
        setIsLoadingExpenses(false);
      }
    }

    void loadInitialExpenses();

    return () => {
      isMounted = false;
    };
  }, [accessToken, showError]);

  const handleNewExpense = () => {
    setShowForm(true);
  };

  const handleSearchPress = () => {
    // open search
  };

  function resetForm() {
    setPaymentMethod('cash');
    setExpenseName('');
    setAmount('');
    setSourceAccountId('');
    setDestinationPaybill('');
    setAccountReference('');
    setRemarks('');
    setRequester('');
  }

  function closeForm() {
    if (isSubmitting) return;
    setShowForm(false);
  }

  function validateForm() {
    if (!selectedExpenseTypeId) return 'Choose an expense type.';
    if (parseAmount(amount) <= 0) return 'Enter a valid expense amount.';

    if (paymentMethod === 'mpesa') {
      if (!sourceAccountId.trim()) return 'Enter the source account ID.';
      if (!destinationPaybill.trim()) return 'Enter the destination paybill.';
      if (!accountReference.trim()) return 'Enter the account reference.';
      if (!remarks.trim() && !expenseName.trim()) return 'Enter remarks for the M-PESA payment.';
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

    if (paymentMethod === 'mpesa') {
      payload.sourceAccountId = Number(sourceAccountId);
      payload.destinationPaybill = destinationPaybill.trim();
      payload.accountReference = accountReference.trim();
      payload.remarks = remarks.trim() || expenseName.trim() || 'Expense payment';
      payload.requester = requester.trim() || undefined;
    }

    setIsSubmitting(true);
    try {
      const response = await authPost<ExpenseApiResponse>('/api/expenses', payload, accessToken);
      const message =
        paymentMethod === 'mpesa'
          ? `M-PESA payment initiated${response.data.b2bConversationId ? `: ${response.data.b2bConversationId}` : ''}`
          : 'Cash expense recorded.';
      showSuccess(message);
      resetForm();
      setShowForm(false);
      await loadExpenses();
    } catch (error) {
      showError(error instanceof ApiError || error instanceof Error ? error.message : 'Could not create expense.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
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
          <ExpensesPageHeader />

          <ExpensesSectionHeader
            months={EXPENSE_MONTHS}
            selected={selectedPeriod}
            onSelect={setSelectedPeriod}
            onSearchPress={handleSearchPress}
          />

          <ExpensesSummaryCard summary={expenseSummary} />

          <ExpensesCategoryFilter
            filters={filterOptions}
            labels={filterLabels}
            selected={activeCategory}
            onSelect={setSelectedCategory}
          />

          {isLoadingExpenses ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={BrandColors.primary} />
              <Text style={styles.loadingText}>Loading expenses...</Text>
            </View>
          ) : null}

          <ExpenseList groups={filteredGroups} onNewExpense={handleNewExpense} />
        </View>
      </ScrollView>

      <Modal visible={showForm} transparent animationType="slide" onRequestClose={closeForm}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}>
          <Pressable style={styles.modalScrim} onPress={closeForm} />
          <View style={[styles.sheet, { paddingBottom: safeAreaInsets.bottom + Spacing.three }]}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>New Expense</Text>
                <Text style={styles.sheetSubtitle}>Create the expense and payment together</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close expense form"
                onPress={closeForm}
                style={styles.closeButton}>
                <XCircle size={25} color={Colors.light.textSecondary} strokeWidth={2.2} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
              <View style={styles.segmented}>
                <PaymentSegment
                  label="Cash"
                  selected={paymentMethod === 'cash'}
                  onPress={() => setPaymentMethod('cash')}
                />
                <PaymentSegment
                  label="M-Pesa Paybill"
                  selected={paymentMethod === 'mpesa'}
                  onPress={() => setPaymentMethod('mpesa')}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Expense Type</Text>
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
              </View>

              <FormInput
                label="Name or Payee"
                value={expenseName}
                onChangeText={setExpenseName}
                placeholder="e.g. Shop rent"
              />

              <FormInput
                label="Amount"
                value={amount}
                onChangeText={(value) => setAmount(formatNumberInput(value))}
                placeholder="0"
                keyboardType="numeric"
              />

              {paymentMethod === 'mpesa' ? (
                <>
                  <FormInput
                    label="Source Account ID"
                    value={sourceAccountId}
                    onChangeText={(value) => setSourceAccountId(value.replace(/\D/g, ''))}
                    placeholder="1"
                    keyboardType="numeric"
                  />
                  <FormInput
                    label="Destination Paybill"
                    value={destinationPaybill}
                    onChangeText={setDestinationPaybill}
                    placeholder="000200"
                    keyboardType="numeric"
                  />
                  <FormInput
                    label="Account Reference"
                    value={accountReference}
                    onChangeText={setAccountReference}
                    placeholder="INV-001"
                    autoCapitalize="characters"
                  />
                  <FormInput
                    label="Remarks"
                    value={remarks}
                    onChangeText={setRemarks}
                    placeholder="Invoice payment"
                  />
                  <FormInput
                    label="Requester Phone"
                    value={requester}
                    onChangeText={setRequester}
                    placeholder="254700000000"
                    keyboardType="phone-pad"
                  />
                </>
              ) : null}

              <AppButton
                label={isSubmitting ? 'Saving...' : paymentMethod === 'mpesa' ? 'Pay Expense' : 'Save Expense'}
                fullWidth
                disabled={isSubmitting}
                onPress={handleSubmitExpense}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
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
  loadingState: {
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  loadingText: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  sheetTitle: {
    color: Colors.light.text,
    fontSize: 20,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: Colors.light.textSecondary,
    fontSize: 13,
    marginTop: Spacing.one,
  },
  closeButton: {
    minHeight: 36,
    minWidth: 36,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  form: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
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
