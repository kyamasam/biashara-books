import { type Href, useRouter } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InventoryCard } from '@/components/inventory/inventory-card';
import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { AppButton } from '@/components/ui/button';
import { BottomTabInset, BrandColors, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useTheme } from '@/hooks/use-theme';
import { useInventoryStore } from '@/store/inventory-store';

type StockFilter = 'all' | 'in' | 'out';

const STOCK_FILTERS: { label: string; value: StockFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'In Stock', value: 'in' },
  { label: 'Out of Stock', value: 'out' },
];

const BOTTOM_APP_BAR_ITEMS: { label: string; icon: AppIconName; href: Href; isActive?: boolean }[] =
  [
    { label: 'Home', icon: 'home', href: '/' },
    { label: 'Pos', icon: 'pos', href: '/sale' },
    { label: 'Books', icon: 'books', href: '/books', isActive: true },
    { label: 'Loans', icon: 'loans', href: '/loans' },
  ];

export default function InventoryScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { accessToken } = useAuth();
  const { showError } = useToast();

  const { items, isLoading, error, fetchInventory } = useInventoryStore();

  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = search.trim() === '' || item.name.toLowerCase().includes(search.toLowerCase());
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'in' && item.inStock) ||
        (stockFilter === 'out' && !item.inStock);
      return matchesSearch && matchesStock;
    });
  }, [items, search, stockFilter]);

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      await fetchInventory(accessToken);
    } catch {
      showError('Could not load inventory.');
    }
  }, [accessToken, fetchInventory, showError]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: safeAreaInsets.top + Spacing.three,
            paddingBottom: safeAreaInsets.bottom + BottomTabInset + Spacing.four,
            paddingLeft: safeAreaInsets.left + Spacing.three,
            paddingRight: safeAreaInsets.right + Spacing.three,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={load}
            tintColor={BrandColors.primary}
          />
        }>
        <View style={styles.page}>
          <PageHeader
            title="Stock"
            showBack
            onBack={() => router.replace('/books')}
            actions={
              <AppButton
                icon={Plus}
                variant="primary"
                size="md"
                label='Add '
                onPress={() => router.push('/inventory/new')}>

              </AppButton>
            }
          />

          {/* Search */}
          <View style={styles.searchRow}>
            <Search size={16} color={Colors.light.textSecondary} strokeWidth={2} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products…"
              placeholderTextColor={Colors.light.textSecondary}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>

          {/* Stock filter chips */}
          <View style={styles.chips}>
            {STOCK_FILTERS.map((f) => (
              <Pressable
                key={f.value}
                style={[styles.chip, stockFilter === f.value && styles.chipActive]}
                onPress={() => setStockFilter(f.value)}>
                <Text style={[styles.chipLabel, stockFilter === f.value && styles.chipLabelActive]}>
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {isLoading && items.length === 0 ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={BrandColors.primary} />
              <Text style={styles.loadingText}>Loading stock…</Text>
            </View>
          ) : error ? (
            <View style={styles.loadingState}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyTitle}>
                {items.length === 0 ? 'Track Your Inventory' : 'No results'}
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.emptySubtitle}>
                {items.length === 0
                  ? 'Add your inventory items here to start tracking inventory'
                  : 'Try adjusting your search or filters'}
              </ThemedText>
              {items.length === 0 && (
                <Pressable
                  onPress={() => router.push('/inventory/new')}
                  style={({ pressed }) => [styles.emptyAddCard, pressed && styles.pressed]}>
                  <Plus size={32} color={Colors.light.textSecondary} strokeWidth={1.5} />
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.list}>
              {filteredItems.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/inventory/${item.id}` as Href)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomAppBar, { paddingBottom: safeAreaInsets.bottom }]}>
        {BOTTOM_APP_BAR_ITEMS.map((item) => (
          <Pressable
            key={item.label}
            accessibilityLabel={item.label}
            accessibilityRole="button"
            accessibilityState={{ selected: item.isActive }}
            onPress={() => router.replace(item.href)}
            style={({ pressed }) => [styles.bottomAppBarItem, pressed && styles.pressed]}>
            <AppIcon
              name={item.icon}
              size={20}
              color={item.isActive ? BrandColors.primary : '#9eaba2'}
              strokeWidth={2.2}
            />
            <Text
              style={[
                styles.bottomAppBarLabel,
                { color: item.isActive ? BrandColors.primary : '#9eaba2' },
              ]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
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
    gap: Spacing.two,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9d9d9',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginTop: Spacing.one,
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111',
    height: '100%',
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9d9d9',
    backgroundColor: '#ffffff',
  },
  chipActive: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
  chipLabelActive: {
    color: '#ffffff',
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
  errorText: {
    color: '#e53e3e',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyState: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    gap: Spacing.three,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  emptyAddCard: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: '#D8DDE0',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: Spacing.two,
  },
  list: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  bottomAppBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 60,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -4 },
    elevation: 5,
  },
  bottomAppBarItem: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bottomAppBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 13,
  },
  pressed: {
    opacity: 0.6,
  },
});
