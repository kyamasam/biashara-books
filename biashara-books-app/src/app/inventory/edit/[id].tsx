import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, Lock } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { BrandColors, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useTheme } from '@/hooks/use-theme';
import { authPut } from '@/lib/api';
import { ApiError } from '@/lib/api-error';
import { useInventoryStore } from '@/store/inventory-store';
import type { InventoryCategory, InventoryType, UnitMetric } from '@/types/product';

function parsePrice(value: string) {
  return Number(value.replace(/,/g, '')) || 0;
}

function formatNumberInput(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-KE', { maximumFractionDigits: 0 });
}

function SectionLabel({ children }: { children: string }) {
  return (
    <View style={styles.sectionLabelRow}>
      <Text style={styles.sectionLabel}>{children}</Text>
      <View style={styles.sectionDivider} />
    </View>
  );
}

function Segment({
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
}: ComponentProps<typeof TextInput> & { label: string }) {
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

export default function EditInventoryScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { accessToken } = useAuth();
  const { showError, showSuccess } = useToast();

  const { id, productId } = useLocalSearchParams<{ id: string; productId: string }>();
  const { items, fetchInventory } = useInventoryStore();

  const product = items.find((p) => p.id === productId);
  const inventory = items.flatMap((p) => p.inventories).find((inv) => inv.id === id);

  const [inventoryCategory, setInventoryCategory] = useState<InventoryCategory>('physical');
  const [inventoryType, setInventoryType] = useState<InventoryType>('count');
  const [quantity, setQuantity] = useState('');
  const [unitMetric, setUnitMetric] = useState<UnitMetric | ''>('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [priceIncludesTax, setPriceIncludesTax] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (inventory && !initialized) {
      setInventoryCategory(inventory.inventoryCategory);
      setInventoryType(inventory.inventoryType);
      setQuantity(inventory.quantity != null ? formatNumberInput(String(inventory.quantity)) : '');
      setUnitMetric(inventory.unitMetric ?? '');
      setPurchasePrice(formatNumberInput(String(inventory.unitPurchasePrice)));
      setSalePrice(formatNumberInput(String(inventory.unitSalePrice)));
      setPriceIncludesTax(inventory.priceIncludesTax);
      setInitialized(true);
    }
  }, [inventory, initialized]);

  const isPhysical = inventoryCategory === 'physical';
  const isUnit = inventoryType === 'unit';

  function validateForm(): string | null {
    if (parsePrice(purchasePrice) <= 0) return 'Enter a valid purchase price.';
    if (parsePrice(salePrice) <= 0) return 'Enter a valid sale price.';
    if (isPhysical && parsePrice(quantity) <= 0) return 'Enter the quantity in stock.';
    if (isPhysical && isUnit && !unitMetric) return 'Choose a unit metric (kg or l).';
    return null;
  }

  async function handleSave() {
    if (!accessToken) {
      showError('Please log in again.');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      showError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await authPut(`/api/inventory/${id}`, {
        productId: productId ?? product?.id ?? '',
        inventoryCategory,
        inventoryType,
        unitPurchasePrice: parsePrice(purchasePrice),
        unitSalePrice: parsePrice(salePrice),
        priceIncludesTax,
        ...(isPhysical && { quantity: parsePrice(quantity) }),
        ...(isPhysical && isUnit && unitMetric && { unitMetric }),
      }, accessToken);

      if (accessToken) await fetchInventory(accessToken);
      showSuccess('Inventory updated.');
      router.back();
    } catch (error) {
      showError(
        error instanceof ApiError || error instanceof Error
          ? error.message
          : 'Could not update inventory.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
          <PageHeader title="Edit Stock" showBack />

          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Update inventory details for this product.
          </ThemedText>

          {/* ── Product (locked) ── */}
          <SectionLabel>Product</SectionLabel>

          <View style={styles.field}>
            <Text style={styles.label}>Product</Text>
            <View style={styles.lockedField}>
              <Text style={styles.lockedText} numberOfLines={1}>
                {product?.name ?? 'Unknown product'}
              </Text>
              <Lock size={14} color={Colors.light.textSecondary} strokeWidth={2} />
            </View>
          </View>

          {/* ── Inventory ── */}
          <SectionLabel>Inventory</SectionLabel>

          <View style={styles.field}>
            <Text style={styles.label}>Product Type</Text>
            <View style={styles.segmented}>
              <Segment
                label="Physical"
                selected={isPhysical}
                onPress={() => setInventoryCategory('physical')}
              />
              <Segment
                label="Service"
                selected={!isPhysical}
                onPress={() => {
                  setInventoryCategory('service');
                  setQuantity('');
                  setUnitMetric('');
                }}
              />
            </View>
          </View>

          {isPhysical ? (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Sold By</Text>
                <View style={styles.segmented}>
                  <Segment
                    label="Count (pcs)"
                    selected={inventoryType === 'count'}
                    onPress={() => {
                      setInventoryType('count');
                      setUnitMetric('');
                    }}
                  />
                  <Segment
                    label="Unit (kg · l)"
                    selected={inventoryType === 'unit'}
                    onPress={() => setInventoryType('unit')}
                  />
                </View>
              </View>

              <FormInput
                label="Quantity in Stock"
                value={quantity}
                onChangeText={(v) => setQuantity(formatNumberInput(v))}
                placeholder="0"
                keyboardType="numeric"
              />

              {isUnit ? (
                <View style={styles.field}>
                  <Text style={styles.label}>Unit Metric</Text>
                  <View style={styles.segmented}>
                    <Segment label="kg" selected={unitMetric === 'kg'} onPress={() => setUnitMetric('kg')} />
                    <Segment label="l" selected={unitMetric === 'l'} onPress={() => setUnitMetric('l')} />
                  </View>
                </View>
              ) : null}
            </>
          ) : null}

          {/* ── Pricing ── */}
          <SectionLabel>Pricing</SectionLabel>

          <View style={styles.priceRow}>
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Purchase Price (KES)</Text>
              <TextInput
                value={purchasePrice}
                onChangeText={(v) => setPurchasePrice(formatNumberInput(v))}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={Colors.light.textSecondary}
                style={styles.input}
              />
            </View>
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Sale Price (KES)</Text>
              <TextInput
                value={salePrice}
                onChangeText={(v) => setSalePrice(formatNumberInput(v))}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={Colors.light.textSecondary}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleBody}>
              <Text style={styles.label}>Price includes tax</Text>
              <ThemedText themeColor="textSecondary" style={styles.toggleHelper}>
                Turn on if the sale price already includes tax.
              </ThemedText>
            </View>
            <Switch
              value={priceIncludesTax}
              onValueChange={setPriceIncludesTax}
              trackColor={{ false: '#D8DDE0', true: BrandColors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <AppButton
            label={isSubmitting ? 'Saving…' : 'Save Changes'}
            fullWidth
            disabled={isSubmitting}
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
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
    fontSize: 13,
    fontWeight: '400',
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  sectionLabel: {
    color: Colors.light.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  field: {
    gap: Spacing.two,
  },
  label: {
    color: Colors.light.text,
    fontSize: 13,
    fontWeight: '800',
  },
  lockedField: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#D8DDE0',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    backgroundColor: '#F9FAFB',
    gap: Spacing.two,
  },
  lockedText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.textSecondary,
    fontWeight: '500',
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
  priceRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  flex1: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D8DDE0',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    backgroundColor: '#FFFFFF',
  },
  toggleBody: {
    flex: 1,
    gap: 3,
  },
  toggleHelper: {
    fontSize: 11,
    fontWeight: '400',
  },
});
