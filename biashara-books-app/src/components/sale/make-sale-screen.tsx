import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeHeader } from '@/components/home/home-header';
import { CategoryFilter, FilterCategory } from '@/components/sale/category-filter';
import { CheckoutBar } from '@/components/sale/checkout-bar';
import { ProductCard } from '@/components/sale/product-card';
import { SearchBar } from '@/components/sale/search-bar';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { authGet } from '@/lib/api';
import { useSaleStore } from '@/store/sale-store';
import {
  ApiProduct,
  CartMap,
  Product,
  ProductCategory,
  ProductCategoryResponse,
  ProductPage,
  ProductsResponse,
} from '@/types/product';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMNS = 3;
const H_PADDING = 12;
const GAP = 8;
const PAGE_SIZE = 20;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - H_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS);

function mapApiProduct(product: ApiProduct, categories: ProductCategory[]): Product {
  const category = categories.find((item) => item.id === product.productCategoryId);
  const primaryInventory = product.inventory[0];

  return {
    id: product.id,
    inventoryId: primaryInventory?.id ?? product.id,
    name: product.name,
    price: primaryInventory?.unitSalePrice ?? product.price,
    imageUrl: product.photoUrl,
    productCategoryId: product.productCategoryId,
    category: category?.name ?? '',
  };
}

export function MakeSaleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { accessToken } = useAuth();
  const setCurrentSale = useSaleStore((state) => state.setCurrentSale);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('All');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
  const [productPage, setProductPage] = useState<ProductPage | null>(null);
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState<CartMap>({});
  const [selectedProducts, setSelectedProducts] = useState<Record<string, Product>>({});
  const [focusedProductId, setFocusedProductId] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    let isMounted = true;

    authGet<ProductCategoryResponse>('/api/categories', accessToken)
      .then((response) => {
        if (isMounted) {
          setCategories(response.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCategories([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  const activeCategory = useMemo(() => {
    if (selectedCategory === 'All') return selectedCategory;
    const selectedExists = categories.some((category) => category.name === selectedCategory);
    return selectedExists ? selectedCategory : 'All';
  }, [categories, selectedCategory]);

  const activeCategoryId = useMemo(() => {
    if (activeCategory === 'All') return null;
    return categories.find((category) => category.name === activeCategory)?.id ?? null;
  }, [activeCategory, categories]);

  useEffect(() => {
    if (!accessToken) return;

    let isMounted = true;

    const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
    if (search) params.set('name', search);
    if (activeCategoryId) params.set('categoryId', activeCategoryId);

    authGet<ProductsResponse>(`/api/products?${params.toString()}`, accessToken)
      .then((response) => {
        if (isMounted) {
          setApiProducts(response.data.content);
          setProductPage(response.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setApiProducts([]);
          setProductPage(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken, page, search, activeCategoryId]);

  const products = useMemo(() => {
    return apiProducts.map((product) => mapApiProduct(product, categories));
  }, [apiProducts, categories]);

  const cartTotal = useMemo(() => {
    return Object.values(selectedProducts).reduce(
      (sum, product) => sum + (cart[product.id] ?? 0) * product.price,
      0,
    );
  }, [cart, selectedProducts]);

  const checkoutItems = useMemo(() => {
    return Object.values(selectedProducts)
      .map((product) => {
        const quantity = cart[product.id] ?? 0;

        return {
          productId: product.id,
          inventoryId: product.inventoryId,
          name: product.name,
          quantity,
          unitPrice: product.price,
          lineTotal: quantity * product.price,
        };
      })
      .filter((item) => item.quantity > 0);
  }, [cart, selectedProducts]);

  useEffect(() => {
    setCurrentSale(checkoutItems);
  }, [checkoutItems, setCurrentSale]);

  const increment = useCallback((product: Product) => {
    setCart((prev) => ({ ...prev, [product.id]: (prev[product.id] ?? 0) + 1 }));
    setSelectedProducts((prev) => ({ ...prev, [product.id]: product }));
    setFocusedProductId(product.id);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCategorySelect = useCallback((value: FilterCategory) => {
    setSelectedCategory(value);
    setPage(1);
  }, []);

  const decrement = useCallback((product: Product) => {
    setCart((prev) => {
      const current = prev[product.id] ?? 0;
      if (current <= 0) return prev;
      return { ...prev, [product.id]: current - 1 };
    });
    setSelectedProducts((prev) => {
      const current = cart[product.id] ?? 0;
      if (current > 1) return prev;

      const next = { ...prev };
      delete next[product.id];
      return next;
    });
    setFocusedProductId(product.id);
  }, [cart]);

  const handleCheckout = useCallback(() => {
    router.push('/checkout');
  }, [router]);

  const checkoutBarBottom = insets.bottom + BottomTabInset + Spacing.two;
  const canGoBack = Boolean(productPage && !productPage.first);
  const canGoForward = Boolean(productPage && !productPage.last);

  const goToPreviousPage = useCallback(() => {
    if (canGoBack) {
      setPage((currentPage) => Math.max(1, currentPage - 1));
    }
  }, [canGoBack]);

  const goToNextPage = useCallback(() => {
    if (canGoForward) {
      setPage((currentPage) => currentPage + 1);
    }
  }, [canGoForward]);

  return (
    <View style={[styles.screen, { backgroundColor: '#FEFDFF' }]}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={COLUMNS}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: insets.top + Spacing.two,
            paddingBottom: checkoutBarBottom + 72,
            paddingHorizontal: H_PADDING,
          },
        ]}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <View style={styles.header}>
            <HomeHeader />
            <SearchBar value={search} onChangeText={handleSearchChange} />
            <CategoryFilter
              categories={categories}
              selected={activeCategory}
              onSelect={handleCategorySelect}
            />
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            quantity={cart[item.id] ?? 0}
            selected={focusedProductId === item.id}
            width={CARD_WIDTH}
            onIncrement={() => increment(item)}
            onDecrement={() => decrement(item)}
          />
        )}
        ListFooterComponent={
          productPage ? (
            <View style={styles.pagination}>
              <TouchableOpacity
                onPress={goToPreviousPage}
                disabled={!canGoBack}
                activeOpacity={0.75}
                style={[styles.paginationButton, !canGoBack && styles.paginationButtonDisabled]}>
                <Text
                  style={[
                    styles.paginationButtonText,
                    !canGoBack && styles.paginationButtonTextDisabled,
                  ]}>
                  Previous
                </Text>
              </TouchableOpacity>
              <Text style={styles.paginationText}>
                Page {productPage.page} of {productPage.totalPages || 1}
              </Text>
              <TouchableOpacity
                onPress={goToNextPage}
                disabled={!canGoForward}
                activeOpacity={0.75}
                style={[styles.paginationButton, !canGoForward && styles.paginationButtonDisabled]}>
                <Text
                  style={[
                    styles.paginationButtonText,
                    !canGoForward && styles.paginationButtonTextDisabled,
                  ]}>
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {cartTotal > 0 && (
        <View
          style={[
            styles.checkoutBarWrapper,
            {
              bottom: checkoutBarBottom,
              paddingHorizontal: H_PADDING,
            },
          ]}>
          <CheckoutBar total={cartTotal} onCheckout={handleCheckout} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    gap: GAP,
  },
  row: {
    gap: GAP,
  },
  header: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  paginationButton: {
    backgroundColor: '#1A6B52',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  paginationButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  paginationButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  paginationButtonTextDisabled: {
    color: '#9CA3AF',
  },
  paginationText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  checkoutBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
