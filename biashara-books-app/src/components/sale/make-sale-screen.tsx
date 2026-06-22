import { useCallback, useMemo, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeHeader } from '@/components/home/home-header';
import { CategoryFilter, FilterCategory } from '@/components/sale/category-filter';
import { CheckoutBar } from '@/components/sale/checkout-bar';
import { ProductCard } from '@/components/sale/product-card';
import { SAMPLE_PRODUCTS } from '@/components/sale/sale-data';
import { SearchBar } from '@/components/sale/search-bar';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { CartMap, Product } from '@/types/product';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMNS = 3;
const H_PADDING = 12;
const GAP = 8;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - H_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS);

export function MakeSaleScreen() {
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('All');
  const [cart, setCart] = useState<CartMap>({});
  const [focusedProductId, setFocusedProductId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return SAMPLE_PRODUCTS.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  const cartTotal = useMemo(() => {
    return SAMPLE_PRODUCTS.reduce((sum, p) => sum + (cart[p.id] ?? 0) * p.price, 0);
  }, [cart]);

  const increment = useCallback((product: Product) => {
    setCart((prev) => ({ ...prev, [product.id]: (prev[product.id] ?? 0) + 1 }));
    setFocusedProductId(product.id);
  }, []);

  const decrement = useCallback((product: Product) => {
    setCart((prev) => {
      const current = prev[product.id] ?? 0;
      if (current <= 0) return prev;
      return { ...prev, [product.id]: current - 1 };
    });
    setFocusedProductId(product.id);
  }, []);

  const checkoutBarBottom = insets.bottom + BottomTabInset + Spacing.two;

  return (
    <View style={[styles.screen, { backgroundColor: '#FEFDFF' }]}>
      <FlatList
        data={filteredProducts}
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
            <SearchBar value={search} onChangeText={setSearch} />
            <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
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
          <CheckoutBar total={cartTotal} onCheckout={() => {}} />
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
  checkoutBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
