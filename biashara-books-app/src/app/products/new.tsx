import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, Check, Image as ImageIcon, Pencil } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { authGet, authPost } from '@/lib/api';
import { ApiError } from '@/lib/api-error';
import { useProductStore } from '@/store/product-store';
import type {
  CreateInventoryRequest,
  InventoryCategory,
  InventoryType,
  ProductCategory,
  UnitMetric,
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
  const { createProduct, isUploading, isCreating } = useProductStore();

  // Product fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Inventory classification
  const [inventoryCategory, setInventoryCategory] = useState<InventoryCategory>('physical');
  const [inventoryType, setInventoryType] = useState<InventoryType>('count');
  const [unitMetric, setUnitMetric] = useState<UnitMetric | ''>('');

  // Stock & pricing
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [priceIncludesTax, setPriceIncludesTax] = useState(false);

  const isPhysical = inventoryCategory === 'physical';
  const isUnit = inventoryType === 'unit';
  const isBusy = isUploading || isCreating;

  useEffect(() => {
    if (!accessToken) return;
    let isMounted = true;

    async function loadCategories() {
      setIsLoadingCategories(true);
      try {
        const response = await authGet<{ data: ProductCategory[] }>('/api/categories', accessToken!);
        if (!isMounted) return;
        setCategories(response.data ?? []);
        setSelectedCategoryId((c) => c || response.data?.[0]?.id || '');
      } catch {
        if (!isMounted) return;
        showError('Could not load categories.');
      } finally {
        if (!isMounted) return;
        setIsLoadingCategories(false);
      }
    }

    void loadCategories();
    return () => { isMounted = false; };
  }, [accessToken, showError]);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showError('Permission to access photos is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }

  function validate(): string | null {
    if (!name.trim()) return 'Enter a product name.';
    if (parsePrice(purchasePrice) <= 0) return 'Enter a valid purchase price.';
    if (parsePrice(salePrice) <= 0) return 'Enter a valid sale price.';
    if (isPhysical && parsePrice(quantity) <= 0) return 'Enter the quantity in stock.';
    if (isPhysical && isUnit && !unitMetric) return 'Choose a unit metric (kg or l).';
    return null;
  }

  async function handleSave() {
    if (!accessToken) { showError('Please log in again.'); return; }
    const err = validate();
    if (err) { showError(err); return; }

    try {
      const { id: productId } = await createProduct(
        {
          name: name.trim(),
          ...(description.trim() && { description: description.trim() }),
          ...(selectedCategoryId && { productCategoryId: selectedCategoryId }),
          inventoryCategory,
          inventoryType,
          ...(isPhysical && isUnit && unitMetric ? { unitMetric } : {}),
        },
        accessToken,
        imageUri ?? undefined,
      );

      const inventoryPayload: CreateInventoryRequest = {
        productId,
        inventoryCategory,
        inventoryType,
        unitPurchasePrice: parsePrice(purchasePrice),
        unitSalePrice: parsePrice(salePrice),
        priceIncludesTax,
        ...(isPhysical && { quantity: parsePrice(quantity) }),
        ...(isPhysical && isUnit && unitMetric ? { unitMetric } : {}),
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
          <PageHeader title="New Product" showBack />

          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Add a product to your catalogue and set its opening stock.
          </ThemedText>

          {/* ─── Photo ─── */}
          <PhotoPicker imageUri={imageUri} onPress={pickImage} isUploading={isUploading} />

          {/* ─── Product Details ─── */}
          <SectionLabel>Product Details</SectionLabel>

          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            {isLoadingCategories ? (
              <ActivityIndicator size="small" color={BrandColors.primary} style={{ alignSelf: 'flex-start' }} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    accessibilityRole="button"
                    onPress={() => setSelectedCategoryId(cat.id)}
                    style={[styles.chip, selectedCategoryId === cat.id && styles.chipSelected]}>
                    <Text style={[styles.chipText, selectedCategoryId === cat.id && styles.chipTextSelected]}>
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          <FormInput
            label="Product Name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Fresh Milk"
          />

          <FormInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Add product details…"
            multiline
            numberOfLines={3}
            style={styles.multilineInput}
          />

          {/* ─── Classification ─── */}
          <SectionLabel>Classification</SectionLabel>

          <View style={styles.field}>
            <Text style={styles.label}>Product Type</Text>
            <View style={styles.segmented}>
              <Segment
                label="Physical"
                selected={isPhysical}
                onPress={() => {
                  setInventoryCategory('physical');
                }}
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
            <ThemedText themeColor="textSecondary" style={styles.hint}>
              {isPhysical
                ? 'Physical goods that can be stocked and counted.'
                : 'Intangible offerings like haircuts or delivery.'}
            </ThemedText>
          </View>

          {isPhysical && (
            <View style={styles.field}>
              <Text style={styles.label}>Sold By</Text>
              <View style={styles.segmented}>
                <Segment
                  label="Count (pcs)"
                  selected={!isUnit}
                  onPress={() => {
                    setInventoryType('count');
                    setUnitMetric('');
                  }}
                />
                <Segment
                  label="Unit (kg · l)"
                  selected={isUnit}
                  onPress={() => setInventoryType('unit')}
                />
              </View>
            </View>
          )}

          {isPhysical && isUnit && (
            <View style={styles.field}>
              <Text style={styles.label}>Unit Metric *</Text>
              <View style={styles.segmented}>
                <Segment label="kg  (weight)" selected={unitMetric === 'kg'} onPress={() => setUnitMetric('kg')} />
                <Segment label="l  (volume)" selected={unitMetric === 'l'} onPress={() => setUnitMetric('l')} />
              </View>
            </View>
          )}

          {/* ─── Stock ─── */}
          {isPhysical && (
            <>
              <SectionLabel>Opening Stock</SectionLabel>
              <FormInput
                label={`Quantity in Stock${isUnit && unitMetric ? ` (${unitMetric})` : ''} *`}
                value={quantity}
                onChangeText={(v) => setQuantity(formatNumberInput(v))}
                placeholder="0"
                keyboardType="numeric"
              />
            </>
          )}

          {/* ─── Pricing ─── */}
          <SectionLabel>Pricing</SectionLabel>

          <View style={styles.priceRow}>
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Purchase Price (KES) *</Text>
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
              <Text style={styles.label}>Sale Price (KES) *</Text>
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
              <ThemedText themeColor="textSecondary" style={styles.hint}>
                Turn on if the sale price already includes VAT.
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
            label={
              isUploading ? 'Uploading photo…' : isCreating ? 'Saving product…' : 'Save Product'
            }
            fullWidth
            disabled={isBusy || isLoadingCategories}
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PhotoPicker({
  imageUri,
  onPress,
  isUploading,
}: {
  imageUri: string | null;
  onPress: () => void;
  isUploading: boolean;
}) {
  if (imageUri) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change product photo"
        onPress={onPress}
        style={styles.photoPickerFilled}>
        <Image source={{ uri: imageUri }} style={styles.photoPreview} />
        {isUploading ? (
          <View style={styles.photoOverlay}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.photoOverlayText}>Uploading…</Text>
          </View>
        ) : (
          <View style={styles.photoEditBadge}>
            <Pencil size={12} color="#FFFFFF" strokeWidth={2.5} />
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add product photo"
      onPress={onPress}
      style={({ pressed }) => [styles.photoPickerEmpty, pressed && styles.pressed]}>
      <View style={styles.photoIconWrapper}>
        <ImageIcon size={28} color={BrandColors.primary} strokeWidth={1.5} />
      </View>
      <View style={styles.photoPickerText}>
        <Text style={styles.photoPickerTitle}>Add a product photo</Text>
        <Text style={styles.photoPickerSubtitle}>Tap to choose from your library</Text>
      </View>
      <Camera size={18} color={Colors.light.textSecondary} strokeWidth={1.8} />
    </Pressable>
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
      {selected ? <Check size={15} color={BrandColors.primary} strokeWidth={2.8} /> : null}
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
  keyboardAvoidingView: { flex: 1 },
  scrollView: { flex: 1 },
  contentContainer: { alignItems: 'center' },
  page: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
  },

  // Photo picker — empty state
  photoPickerEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: '#D8DDE0',
    borderRadius: 12,
    backgroundColor: '#FAFBFC',
  },
  photoIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#E8F7EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPickerText: { flex: 1, gap: 2 },
  photoPickerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  photoPickerSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '400',
  },

  // Photo picker — filled state
  photoPickerFilled: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 180,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  photoOverlayText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section headers
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
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

  // Form elements
  field: { gap: Spacing.two },
  label: {
    color: Colors.light.text,
    fontSize: 13,
    fontWeight: '800',
  },
  hint: {
    fontSize: 11,
    fontWeight: '400',
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

  // Category chips
  chips: { gap: Spacing.two, paddingRight: Spacing.three },
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
  chipTextSelected: { color: BrandColors.primary },

  // Segmented controls
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
    gap: Spacing.one,
  },
  segmentSelected: { backgroundColor: '#E8F7EE' },
  segmentText: {
    color: Colors.light.text,
    fontSize: 13,
    fontWeight: '700',
  },
  segmentTextSelected: { color: Colors.light.text },

  // Price row
  priceRow: { flexDirection: 'row', gap: Spacing.two },
  flex1: { flex: 1 },

  // Tax toggle
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
  toggleBody: { flex: 1, gap: 3 },

  pressed: { opacity: 0.6 },
});
