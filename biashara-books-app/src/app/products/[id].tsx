import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, Check, Image as ImageIcon, Pencil } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
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

import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/button';
import { BrandColors, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useTheme } from '@/hooks/use-theme';
import { authGet } from '@/lib/api';
import { ApiError } from '@/lib/api-error';
import { useProductStore } from '@/store/product-store';
import type {
  InventoryCategory,
  InventoryType,
  ProductCategory,
  ProductEntityResponse,
  UnitMetric,
} from '@/types/product';

const UNIT_METRIC_OPTIONS: { value: UnitMetric; label: string; group: string }[] = [
  { value: 'kg', label: 'kg — Kilogram', group: 'Weight' },
  { value: 'g', label: 'g — Gram', group: 'Weight' },
  { value: 'mg', label: 'mg — Milligram', group: 'Weight' },
  { value: 'lb', label: 'lb — Pound', group: 'Weight' },
  { value: 'oz', label: 'oz — Ounce', group: 'Weight' },
  { value: 'l', label: 'l — Litre', group: 'Volume' },
  { value: 'ml', label: 'ml — Millilitre', group: 'Volume' },
  { value: 'm', label: 'm — Metre', group: 'Length' },
  { value: 'cm', label: 'cm — Centimetre', group: 'Length' },
  { value: 'mm', label: 'mm — Millimetre', group: 'Length' },
  { value: 'ft', label: 'ft — Foot', group: 'Length' },
  { value: 'dozen', label: 'dozen — Dozen (12)', group: 'Packaging' },
  { value: 'box', label: 'box — Box', group: 'Packaging' },
  { value: 'bag', label: 'bag — Bag', group: 'Packaging' },
  { value: 'bundle', label: 'bundle — Bundle', group: 'Packaging' },
  { value: 'pack', label: 'pack — Pack', group: 'Packaging' },
  { value: 'crate', label: 'crate — Crate', group: 'Packaging' },
  { value: 'carton', label: 'carton — Carton', group: 'Packaging' },
  { value: 'roll', label: 'roll — Roll', group: 'Packaging' },
  { value: 'pair', label: 'pair — Pair', group: 'Packaging' },
  { value: 'set', label: 'set — Set', group: 'Packaging' },
];

const UNIT_GROUPS = ['Weight', 'Volume', 'Length', 'Packaging'];

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { accessToken } = useAuth();
  const { showError, showSuccess } = useToast();
  const { uploadPhoto, updateProduct, isUploading, isCreating } = useProductStore();

  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [inventoryCategory, setInventoryCategory] = useState<InventoryCategory>('physical');
  const [inventoryType, setInventoryType] = useState<InventoryType>('count');
  const [unitMetric, setUnitMetric] = useState<UnitMetric | ''>('');
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const isPhysical = inventoryCategory === 'physical';
  const isUnit = inventoryType === 'unit';
  const isBusy = isUploading || isCreating;

  useEffect(() => {
    if (!accessToken || !id) return;
    let isMounted = true;

    async function loadData() {
      setIsLoadingProduct(true);
      setIsLoadingCategories(true);
      try {
        const [productResponse, categoriesResponse] = await Promise.all([
          authGet<ProductEntityResponse>(`/api/products/${id}`),
          authGet<{ data: ProductCategory[] }>('/api/categories'),
        ]);

        if (!isMounted) return;

        const product = productResponse.data;
        setName(product.name);
        setDescription(product.description ?? '');
        setUploadedPhotoUrl(product.photoUrl ?? null);
        setSelectedCategoryId(product.productCategoryId ?? '');
        setInventoryCategory(product.inventoryCategory);
        setInventoryType(product.inventoryType);
        setUnitMetric((product.unitMetric as UnitMetric | null) ?? '');
        setCategories(categoriesResponse.data ?? []);
      } catch {
        if (!isMounted) return;
        showError('Could not load product details.');
      } finally {
        if (!isMounted) return;
        setIsLoadingProduct(false);
        setIsLoadingCategories(false);
      }
    }

    void loadData();
    return () => { isMounted = false; };
  }, [accessToken, id, showError]);

  async function pickImage() {
    if (!accessToken) { showError('Please log in again.'); return; }
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
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setUploadedPhotoUrl(null);
      try {
        const url = await uploadPhoto(uri);
        setUploadedPhotoUrl(url);
      } catch {
        showError('Photo upload failed. You can still save.');
      }
    }
  }

  function validate(): string | null {
    if (!name.trim()) return 'Enter a product name.';
    if (isPhysical && isUnit && !unitMetric) return 'Choose a unit metric.';
    return null;
  }

  async function handleSave() {
    if (!accessToken || !id) { showError('Please log in again.'); return; }
    const err = validate();
    if (err) { showError(err); return; }

    try {
      await updateProduct(id, {
        name: name.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(selectedCategoryId ? { productCategoryId: selectedCategoryId } : {}),
        inventoryCategory,
        inventoryType,
        ...(uploadedPhotoUrl ? { photoUrl: uploadedPhotoUrl } : {}),
        ...(isPhysical && isUnit && unitMetric ? { unitMetric } : {}),
      });

      showSuccess('Product updated.');
      router.back();
    } catch (error) {
      showError(
        error instanceof ApiError || error instanceof Error
          ? error.message
          : 'Could not update product.',
      );
    }
  }

  if (isLoadingProduct) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={BrandColors.primary} />
        <ThemedText themeColor="textSecondary" style={styles.loadingText}>
          Loading product…
        </ThemedText>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
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
          <PageHeader title="Edit Product" showBack />

          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Update the details for this product.
          </ThemedText>

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

          <PhotoPicker
            imageUri={uploadedPhotoUrl ?? imageUri}
            onPress={pickImage}
            isUploading={isUploading}
          />

          <SectionLabel>Classification</SectionLabel>

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
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowUnitPicker(true)}
                style={styles.dropdownTrigger}>
                <Text style={unitMetric ? styles.dropdownValue : styles.dropdownPlaceholder}>
                  {unitMetric
                    ? UNIT_METRIC_OPTIONS.find((o) => o.value === unitMetric)?.label ?? unitMetric
                    : 'Select a unit…'}
                </Text>
                <Text style={styles.dropdownChevron}>▾</Text>
              </Pressable>
            </View>
          )}

          <UnitMetricPicker
            visible={showUnitPicker}
            selected={unitMetric as UnitMetric | ''}
            onSelect={(v) => { setUnitMetric(v); setShowUnitPicker(false); }}
            onClose={() => setShowUnitPicker(false)}
          />

          <AppButton
            label={isUploading ? 'Uploading photo…' : isCreating ? 'Saving…' : 'Save Changes'}
            fullWidth
            disabled={isBusy || isLoadingCategories}
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </>
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
      style={styles.photoPickerEmpty}>
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

function UnitMetricPicker({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: UnitMetric | '';
  onSelect: (v: UnitMetric) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.pickerBackdrop} onPress={onClose} />
      <View style={styles.pickerSheet}>
        <View style={styles.pickerHeader}>
          <Text style={styles.pickerTitle}>Select Unit Metric</Text>
          <Pressable onPress={onClose} style={styles.pickerCloseBtn}>
            <Text style={styles.pickerCloseText}>Done</Text>
          </Pressable>
        </View>
        <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
          {UNIT_GROUPS.map((group) => (
            <View key={group}>
              <Text style={styles.pickerGroup}>{group}</Text>
              {UNIT_METRIC_OPTIONS.filter((o) => o.group === group).map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => onSelect(option.value)}
                  style={[styles.pickerRow, selected === option.value && styles.pickerRowSelected]}>
                  <Text style={[styles.pickerRowText, selected === option.value && styles.pickerRowTextSelected]}>
                    {option.label}
                  </Text>
                  {selected === option.value && (
                    <Check size={16} color={BrandColors.primary} strokeWidth={2.8} />
                  )}
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
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
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  loadingText: { fontSize: 14, fontWeight: '500' },

  keyboardAvoidingView: { flex: 1 },
  scrollView: { flex: 1 },
  contentContainer: { alignItems: 'center' },
  page: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  subtitle: { fontSize: 13, fontWeight: '400' },

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
  photoPickerTitle: { fontSize: 14, fontWeight: '700', color: Colors.light.text },
  photoPickerSubtitle: { fontSize: 12, color: Colors.light.textSecondary, fontWeight: '400' },
  photoPickerFilled: { borderRadius: 0, height: 180, alignItems: 'center' },
  photoPreview: { width: 100, height: '100%' },
  photoOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  photoOverlayText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  photoEditBadge: {
    position: 'absolute',
    bottom: 10, right: 10,
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

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
  sectionDivider: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },

  field: { gap: Spacing.two },
  label: { color: Colors.light.text, fontSize: 13, fontWeight: '800' },
  hint: { fontSize: 11, fontWeight: '400' },
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
  multilineInput: { minHeight: 80, paddingTop: Spacing.two, paddingBottom: Spacing.two, textAlignVertical: 'top' },

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
  chipSelected: { borderColor: BrandColors.primary, backgroundColor: '#E8F7EE' },
  chipText: { color: Colors.light.text, fontSize: 13, fontWeight: '700' },
  chipTextSelected: { color: BrandColors.primary },

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
  segmentText: { color: Colors.light.text, fontSize: 13, fontWeight: '700' },
  segmentTextSelected: { color: Colors.light.text },

  dropdownTrigger: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#D8DDE0',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValue: { fontSize: 15, color: Colors.light.text, flex: 1 },
  dropdownPlaceholder: { fontSize: 15, color: Colors.light.textSecondary, flex: 1 },
  dropdownChevron: { fontSize: 16, color: Colors.light.textSecondary, marginLeft: Spacing.two },

  pickerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: Spacing.four,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  pickerTitle: { fontSize: 15, fontWeight: '700', color: Colors.light.text },
  pickerCloseBtn: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.one },
  pickerCloseText: { fontSize: 14, fontWeight: '700', color: BrandColors.primary },
  pickerScroll: { paddingHorizontal: Spacing.three },
  pickerGroup: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: Colors.light.textSecondary,
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: Spacing.two,
    borderRadius: 8,
  },
  pickerRowSelected: { backgroundColor: '#E8F7EE' },
  pickerRowText: { fontSize: 14, color: Colors.light.text, fontWeight: '500' },
  pickerRowTextSelected: { color: BrandColors.primary, fontWeight: '700' },
});
