import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Package, Pencil, Plus, Search, Trash2, X } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductCategoryFilter } from '@/components/products/category-filter';
import { ThemedText } from '@/components/themed-text';
import { BrandColors, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useToast } from '@/context/toast-context';
import { useTheme } from '@/hooks/use-theme';
import { useProductStore } from '@/store/product-store';
import type { ApiProduct, ProductCategory } from '@/types/product';

const PAGE_SIZE = 20;

const formatPrice = (price: number) =>
  `KES ${price.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

type CategoryModal =
  | { mode: 'add' }
  | { mode: 'edit'; category: ProductCategory };

export default function ProductsScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { showError, showSuccess } = useToast();
  const {
    products,
    categories,
    currentPage,
    totalPages,
    isLoading,
    isFetchingMore,
    isManagingCategory,
    fetchProducts,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    deleteProduct,
  } = useProductStore();

  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [categoryModal, setCategoryModal] = useState<CategoryModal | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const nameInputRef = useRef<TextInput>(null);

  const load = useCallback(
    (categoryId: string | null = selectedCategoryId) => {
      void fetchProducts(1, PAGE_SIZE, undefined, categoryId ?? undefined).catch(() =>
        showError('Could not load products.'),
      );
    },
    [fetchProducts, selectedCategoryId, showError],
  );

  useEffect(() => {
    load(null);
    void fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCategorySelect(categoryName: string) {
    if (categoryName === 'All') {
      setSelectedCategoryId(null);
      void fetchProducts(1, PAGE_SIZE).catch(() => showError('Could not load products.'));
    } else {
      const cat = categories.find((c) => c.name === categoryName);
      const id = cat?.id ?? null;
      setSelectedCategoryId(id);
      void fetchProducts(1, PAGE_SIZE, undefined, id ?? undefined).catch(() =>
        showError('Could not load products.'),
      );
    }
  }

  function handleLoadMore() {
    if (currentPage >= totalPages || isFetchingMore) return;
    void fetchProducts(currentPage + 1, PAGE_SIZE, undefined, selectedCategoryId ?? undefined, true).catch(() =>
      showError('Could not load more products.'),
    );
  }

  function openAddModal() {
    setCategoryName('');
    setCategoryModal({ mode: 'add' });
    setTimeout(() => nameInputRef.current?.focus(), 100);
  }

  function openEditModal(category: ProductCategory) {
    setCategoryName(category.name);
    setCategoryModal({ mode: 'edit', category });
    setTimeout(() => nameInputRef.current?.focus(), 100);
  }

  function closeModal() {
    setCategoryModal(null);
    setCategoryName('');
  }

  async function handleSaveCategory() {
    const trimmed = categoryName.trim();
    if (!trimmed) return;

    try {
      if (categoryModal?.mode === 'add') {
        await createCategory(trimmed);
        showSuccess(`"${trimmed}" added.`);
      } else if (categoryModal?.mode === 'edit') {
        await updateCategory(categoryModal.category.id, trimmed);
        showSuccess(`"${trimmed}" updated.`);
      }
      closeModal();
    } catch {
      showError('Could not save category.');
    }
  }


  const selectedCategoryName =
    selectedCategoryId
      ? (categories.find((c) => c.id === selectedCategoryId)?.name ?? 'All')
      : 'All';

  const filtered = search.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()))
    : products;

  function handleEdit(product: ApiProduct) {
    router.push(`/products/${product.id}` as never);
  }

  function handleDelete(product: ApiProduct) {
    Alert.alert(
      'Delete Product',
      `Remove "${product.name}" from your catalogue? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(product.id);
            try {
              await deleteProduct(product.id);
              showSuccess(`"${product.name}" deleted.`);
            } catch {
              showError('Could not delete product.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  }

  const hasMore = currentPage < totalPages;

  return (
    <>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingBottom: safeAreaInsets.bottom + Spacing.four,
            paddingLeft: safeAreaInsets.left + Spacing.three,
            paddingRight: safeAreaInsets.right + Spacing.three,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => load(selectedCategoryId)}
            tintColor={BrandColors.primary}
            colors={[BrandColors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}>
        <View style={styles.page}>
          <View style={styles.topRow}>
            <View style={[styles.searchRow, { flex: 1 }]}>
              <Search size={16} color={Colors.light.textSecondary} strokeWidth={2} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search products…"
                placeholderTextColor={Colors.light.textSecondary}
                style={styles.searchInput}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            </View>
            <Pressable
              accessibilityLabel="Add product"
              accessibilityRole="button"
              onPress={() => router.push('/products/new')}
              style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
              <Plus size={18} color="#ffffff" strokeWidth={2.6} />
              <Text style={styles.addButtonLabel}>Add</Text>
            </Pressable>
          </View>

          <ProductCategoryFilter
            categories={categories}
            selected={selectedCategoryName}
            onSelect={handleCategorySelect}
            onPressAdd={openAddModal}
            onPressManage={() => setManageCategoriesOpen(true)}
          />

          {isLoading && products.length === 0 ? (
            <View style={styles.centerState}>
              <ActivityIndicator color={BrandColors.primary} />
              <ThemedText themeColor="textSecondary" style={styles.stateText}>
                Loading products…
              </ThemedText>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.centerState}>
              <View style={styles.emptyIconWrapper}>
                <Package size={32} color={Colors.light.textSecondary} strokeWidth={1.5} />
              </View>
              <ThemedText themeColor="textSecondary" style={styles.stateText}>
                {search.trim() ? 'No products match your search.' : 'No products yet. Tap Add to create one.'}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.list}>
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isDeleting={deletingId === product.id}
                  onEdit={() => handleEdit(product)}
                  onDelete={() => handleDelete(product)}
                />
              ))}

              {hasMore && (
                <Pressable
                  onPress={handleLoadMore}
                  disabled={isFetchingMore}
                  style={({ pressed }) => [styles.loadMoreBtn, pressed && styles.pressed]}>
                  {isFetchingMore ? (
                    <ActivityIndicator size="small" color={BrandColors.primary} />
                  ) : (
                    <Text style={styles.loadMoreText}>Load more</Text>
                  )}
                </Pressable>
              )}

              {!hasMore && products.length > 0 && (
                <Text style={styles.endText}>All {products.length} products shown</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Category list / manage sheet */}
      <Modal
        visible={manageCategoriesOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setManageCategoriesOpen(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setManageCategoriesOpen(false)} />
          <View style={[styles.sheet, styles.manageSheet, { paddingBottom: safeAreaInsets.bottom + Spacing.three }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Categories</Text>
              <Pressable
                onPress={() => setManageCategoriesOpen(false)}
                style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}>
                <X size={18} color={Colors.light.textSecondary} strokeWidth={2.2} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.categoryList}>
              {categories.length === 0 ? (
                <Text style={styles.emptyCategoriesText}>No categories yet. Tap "+" to add one.</Text>
              ) : (
                categories.map((cat, idx) => (
                  <View
                    key={cat.id}
                    style={[styles.categoryRow, idx < categories.length - 1 && styles.categoryRowBorder]}>
                    <Text style={styles.categoryRowName} numberOfLines={1}>{cat.name}</Text>
                    <View style={styles.categoryRowActions}>
                      <Pressable
                        accessibilityLabel={`Edit ${cat.name}`}
                        onPress={() => {
                          setManageCategoriesOpen(false);
                          setTimeout(() => openEditModal(cat), 250);
                        }}
                        style={({ pressed }) => [styles.rowActionBtn, pressed && styles.pressed]}>
                        <Pencil size={16} color={BrandColors.primary} strokeWidth={2.2} />
                      </Pressable>
                      <Pressable
                        accessibilityLabel={`Delete ${cat.name}`}
                        onPress={() => {
                          Alert.alert(
                            'Delete Category',
                            `Remove "${cat.name}"? Products in this category will be uncategorised.`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: async () => {
                                  try {
                                    await deleteCategory(cat.id);
                                    if (selectedCategoryId === cat.id) {
                                      setSelectedCategoryId(null);
                                      void fetchProducts(1, PAGE_SIZE).catch(() =>
                                        showError('Could not reload products.'),
                                      );
                                    }
                                    showSuccess(`"${cat.name}" deleted.`);
                                  } catch {
                                    showError('Could not delete category.');
                                  }
                                },
                              },
                            ],
                          );
                        }}
                        style={({ pressed }) => [styles.rowActionBtn, pressed && styles.pressed]}>
                        <Trash2 size={16} color="#d72450" strokeWidth={2.2} />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add / rename category sheet */}
      <Modal
        visible={categoryModal !== null}
        transparent
        animationType="slide"
        onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          <View style={[styles.sheet, { paddingBottom: safeAreaInsets.bottom + Spacing.three }]}>
            <View style={styles.handle} />

            <Text style={styles.sheetTitle}>
              {categoryModal?.mode === 'add' ? 'New Category' : 'Rename Category'}
            </Text>

            <TextInput
              ref={nameInputRef}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Category name"
              placeholderTextColor={Colors.light.textSecondary}
              style={styles.sheetInput}
              returnKeyType="done"
              onSubmitEditing={handleSaveCategory}
              autoCapitalize="words"
            />

            <Pressable
              onPress={handleSaveCategory}
              disabled={isManagingCategory || !categoryName.trim()}
              style={({ pressed }) => [
                styles.saveBtn,
                (!categoryName.trim() || isManagingCategory) && styles.saveBtnDisabled,
                pressed && styles.pressed,
              ]}>
              {isManagingCategory ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {categoryModal?.mode === 'add' ? 'Add Category' : 'Save Changes'}
                </Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

function ProductCard({
  product,
  isDeleting,
  onEdit,
  onDelete,
}: {
  product: ApiProduct;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardPhoto}>
        {product.photoUrl ? (
          <Image source={{ uri: product.photoUrl }} style={styles.photo} contentFit="cover" />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Package size={22} color={BrandColors.primary} strokeWidth={1.5} />
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>
        {product.description ? (
          <Text style={styles.productDescription} numberOfLines={1}>
            {product.description}
          </Text>
        ) : null}
        <View style={styles.cardMeta}>
          <Text style={styles.priceTag}>{formatPrice(product.price ?? 0)}</Text>
          {product.totalQuantity != null ? (
            <Text style={[styles.stockBadge, product.totalQuantity <= 0 && styles.stockBadgeEmpty]}>
              {product.totalQuantity <= 0 ? 'Out of stock' : `${product.totalQuantity} in stock`}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.cardActions}>
        <Pressable
          accessibilityLabel={`Edit ${product.name}`}
          accessibilityRole="button"
          onPress={onEdit}
          style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
          <Pencil size={17} color={BrandColors.primary} strokeWidth={2.2} />
        </Pressable>
        <Pressable
          accessibilityLabel={`Delete ${product.name}`}
          accessibilityRole="button"
          disabled={isDeleting}
          onPress={onDelete}
          style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
          {isDeleting ? (
            <ActivityIndicator size="small" color="#d72450" />
          ) : (
            <Trash2 size={17} color="#d72450" strokeWidth={2.2} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  contentContainer: { alignItems: 'center' },
  page: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 24,
    gap: Spacing.two,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: BrandColors.primary,
  },
  addButtonLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: '#D8DDE0',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
  },

  centerState: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F0F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  list: { gap: Spacing.two },

  loadMoreBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BrandColors.primary,
    minHeight: 44,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.primary,
  },
  endText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.light.textSecondary,
    paddingVertical: Spacing.two,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    shadowColor: '#111111',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardPhoto: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
  },
  photo: { width: 52, height: 52 },
  photoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#E8F7EE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardBody: {
    flex: 1,
    gap: 3,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  productDescription: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '400',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  priceTag: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.primary,
  },
  stockBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
    backgroundColor: '#F0F0F3',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  stockBadgeEmpty: {
    color: '#d72450',
    backgroundColor: '#fef2f4',
  },

  cardActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F3',
  },
  pressed: { opacity: 0.6 },

  // Modal / sheet
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: Spacing.one,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
  },
  sheetInput: {
    borderWidth: 1,
    borderColor: '#D8DDE0',
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
    backgroundColor: '#FAFAFA',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d72450',
  },
  saveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: BrandColors.primary,
    minHeight: 48,
  },
  saveBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Manage categories sheet
  manageSheet: {
    maxHeight: '75%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryList: {
    flexGrow: 0,
  },
  emptyCategoriesText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: Spacing.two,
  },
  categoryRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  categoryRowName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.text,
  },
  categoryRowActions: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  rowActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F3',
  },
});
