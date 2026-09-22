import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { AppButton } from '@/components/ui/button';
import { BrandColors, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useTheme } from '@/hooks/use-theme';
import { authGet, authPost } from '@/lib/api';
import { ApiError } from '@/lib/api-error';
import type {
  CreateInventoryRequest,
  CreateProductRequest,
  InventoryCategory,
  InventoryType,
  ProductCategory,
} from '@/types/product';

function parsePrice(value: string) {
  return Number(value.replace(/,/g, '')) || 0;
}

function formatNumberInput(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-KE', { maximumFractionDigits: 0 });
}

export default function NewProductScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { accessToken } = useAuth();
  const { showError, showSuccess } = useToast();

  // Product fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Inventory fields
  const [inventoryCategory, setInventoryCategory] = useState<InventoryCategory>('physical');
  const [inventoryType, setInventoryType] = useState<InventoryType>('count');
  const [quantity, setQuantity] = useState('');
  const [unitMetric, setUnitMetric] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    let isMounted = true;
    const token = accessToken;

    async function loadCategories() {
      setIsLoadingCategories(true);
      try {
        const response = await authGet<{ data: ProductCategory[] }>('/api/categories', token);
        if (!isMounted) return;
        setCategories(response.data ?? []);
        setSelectedCategoryId((current) => current || response.data?.[0]?.id || '');
      } catch {
        if (!isMounted) return;
        showError('Could not load categories.');
      } finally {
        if (!isMounted) return;
        setIsLoadingCategories(false);
      }
    }

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, [accessToken, showError]);

  function validateForm(): string | null {
    if (!name.trim()) return 'Enter a product name.';
    if (parsePrice(purchasePrice) <= 0) return 'Enter a valid purchase price.';
    if (parsePrice(salePrice) <= 0) return 'Enter a valid sale price.';
    if (inventoryCategory === 'physical' && parsePrice(quantity) <= 0) {
      return 'Enter the quantity in stock.';
    }
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
      const productPayload: CreateProductRequest = {
        name: name.trim(),
        ...(description.trim() && { description: description.trim() }),
        ...(photoUrl.trim() && { photoUrl: photoUrl.trim() }),
        ...(selectedCategoryId && { productCategoryId: selectedCategoryId }),
      };

      const productResponse = await authPost<{ data: { id: string } }>(
        '/api/products',
        productPayload,
        accessToken,
      );

      const productId = productResponse.data.id;

      const inventoryPayload: CreateInventoryRequest = {
        productId,
        inventoryCategory,
        inventoryType,
        unitPurchasePrice: parsePrice(purchasePrice),
        unitSalePrice: parsePrice(salePrice),
        priceIncludesTax: false,
        ...(inventoryCategory === 'physical' && { quantity: parsePrice(quantity) }),
        ...(inventoryCategory === 'physical' && unitMetric.trim() && { unitMetric: unitMetric.trim() }),
      };

      await authPost('/api/inventory', inventoryPayload, accessToken);

      showSuccess('Product created.');
      router.back();
    } catch (error) {
      showError(
        error instanceof ApiError || error instanceof Error
          ? error.message
          : 'Could not create product.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isPhysical = inventoryCategory === 'physical';

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
        <PageHeader title="New Product" showBack />

        {/* ── Product Details ── */}
        <SectionLabel>Product Details</SectionLabel>

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          {isLoadingCategories ? (
            <Text style={styles.helperText}>Loading categories…</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  accessibilityRole="button"
                  onPress={() => setSelectedCategoryId(cat.id)}
                  style={[styles.chip, selectedCategoryId === cat.id && styles.chipSelected]}>
                  <Text
                    style={[
                      styles.chipText,
                      selectedCategoryId === cat.id && styles.chipTextSelected,
                    ]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        <FormInput
          label="Product Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Fresh Milk"
        />

        <FormInput
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Add product details…"
          multiline
          numberOfLines={3}
          style={styles.multilineInput}
        />

        <FormInput
          label="Photo URL (Optional)"
          value={photoUrl}
          onChangeText={setPhotoUrl}
          placeholder="https://…"
          keyboardType="url"
          autoCapitalize="none"
        />

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
              onPress={() => setInventoryCategory('service')}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Sold by</Text>
          <View style={styles.segmented}>
            <Segment
              label="Count (pcs)"
              selected={inventoryType === 'count'}
              onPress={() => setInventoryType('count')}
            />
            <Segment
              label="Unit (kg / l)"
              selected={inventoryType === 'unit'}
              onPress={() => setInventoryType('unit')}
            />
          </View>
        </View>

        {isPhysical && (
          <>
            <FormInput
              label="Quantity in Stock"
              value={quantity}
              onChangeText={(v) => setQuantity(formatNumberInput(v))}
              placeholder="0"
              keyboardType="numeric"
            />
            <FormInput
              label="Unit Metric (Optional)"
              value={unitMetric}
              onChangeText={setUnitMetric}
              placeholder="kg, l, pcs…"
              autoCapitalize="none"
            />
          </>
        )}

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

        <AppButton
          label={isSubmitting ? 'Saving…' : 'Save Product'}
          fullWidth
          disabled={isSubmitting || isLoadingCategories}
          onPress={handleSave}
        />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
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
  multilineInput: {
    minHeight: 80,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    textAlignVertical: 'top',
  },
  chips: {
    gap: Spacing.two,
    paddingRight: Spacing.three,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#D8DDE0',
    borderRadius: 999,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    borderColor: BrandColors.primary,
    backgroundColor: '#E8F7EE',
  },
  chipText: {
    color: Colors.light.text,
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: BrandColors.primary,
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
});
