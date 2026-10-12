import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { Package, Pencil, Plus, Search, Trash2 } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { CategoryManagement } from '@/components/products/category-management';
import { ProductCategoryFilter } from '@/components/products/category-filter';
import { ThemedText } from '@/components/themed-text';
import { BrandColors, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useToast } from '@/context/toast-context';
import { useTheme } from '@/hooks/use-theme';
import { resolveMediaUrl } from '@/lib/api';
import { useProductStore } from '@/store/product-store';
import type { ApiProduct } from '@/types/product';

const PAGE_SIZE = 20;

const formatPrice = (price: number) =>
  `KES ${price.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export default function ProductsScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { showError } = useToast();
  const {
    products,
    categories,
    currentPage,
    totalPages,
    isLoading,
    isFetchingMore,
    fetchProducts,
    fetchCategories,
    deleteProduct,
  } = useProductStore();

  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

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

  function handleCategorySelect(name: string) {
    if (name === 'All') {
      setSelectedCategoryId(null);
      void fetchProducts(1, PAGE_SIZE).catch(() => showError('Could not load products.'));
    } else {
      const cat = categories.find((c) => c.name === name);
      const id = cat?.id ?? null;
      setSelectedCategoryId(id);
      void fetchProducts(1, PAGE_SIZE, undefined, id ?? undefined).catch(() =>
        showError('Could not load products.'),
      );
    }
  }

  function handleLoadMore() {
    if (currentPage >= totalPages || isFetchingMore) return;
    void fetchProducts(currentPage + 1, PAGE_SIZE, undefined, selectedCategoryId ?? undefined, true).catch(
      () => showError('Could not load more products.'),
    );
  }

  function handleCategoryDeleted(_deletedId: string) {
    setSelectedCategoryId(null);
    void fetchProducts(1, PAGE_SIZE).catch(() => showError('Could not reload products.'));
  }

  const selectedCategoryName = selectedCategoryId
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
      `Deleting "${product.name}" will also remove all its inventory records. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(product.id);
            try {
              await deleteProduct(product.id);
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
      <Stack.Screen options={{ headerShown: false }} />
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
          <PageHeader title="Products" showBack />

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
              style={styles.addButton}>
              <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>
          </View>

          <ProductCategoryFilter
            categories={categories}
            selected={selectedCategoryName}
            onSelect={handleCategorySelect}
            onPressAdd={() => setAddCategoryOpen(true)}
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

      <CategoryManagement
        manageVisible={manageCategoriesOpen}
        onManageClose={() => setManageCategoriesOpen(false)}
        addVisible={addCategoryOpen}
        onAddClose={() => setAddCategoryOpen(false)}
        selectedCategoryId={selectedCategoryId}
        onCategoryDeleted={handleCategoryDeleted}
      />
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
          <Image
            source={{ uri: resolveMediaUrl(product.photoUrl) ?? product.photoUrl }}
            style={styles.photo}
            contentFit="cover"
          />
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
    gap: Spacing.two,
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.primary,
    borderRadius: 12,
    width: 44,
    height: 44,
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
    gap: Spacing.four,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F3',
  },
  pressed: { opacity: 0.6 },
});
