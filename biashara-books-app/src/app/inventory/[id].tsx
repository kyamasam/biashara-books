import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Package, Pencil, Plus, Zap } from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/page-header';
import { ThemedText } from '@/components/themed-text';
import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { AppButton } from '@/components/ui/button';
import { BottomTabInset, BrandColors, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useTheme } from '@/hooks/use-theme';
import { useInventoryStore } from '@/store/inventory-store';
import type { InventoryListItem } from '@/types/product';

const BOTTOM_APP_BAR_ITEMS: { label: string; icon: AppIconName; href: Href; isActive?: boolean }[] =
  [
    { label: 'Home', icon: 'home', href: '/' },
    { label: 'Pos', icon: 'pos', href: '/sale' },
    { label: 'Books', icon: 'books', href: '/books', isActive: true },
    { label: 'Loans', icon: 'loans', href: '/loans' },
  ];

function formatKes(value: number | null | undefined) {
  if (value == null) return '—';
  return `KES ${Number(value).toLocaleString('en-KE')}`;
}

function formatDaysAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function quantityLabel(inv: Omit<InventoryListItem, 'product'>) {
  if (inv.inventoryCategory === 'service') return 'Service';
  if (inv.inventoryType === 'unit') return `${inv.quantity ?? 0} ${inv.unitMetric ?? ''}`.trim();
  return `${inv.quantity ?? 0} pcs`;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <View style={styles.sectionLabelRow}>
      <Text style={styles.sectionLabel}>{children}</Text>
      <View style={styles.sectionDivider} />
    </View>
  );
}

export default function InventoryDetailScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { accessToken } = useAuth();
  const { showError } = useToast();

  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, isLoading, fetchInventory } = useInventoryStore();

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      await fetchInventory(accessToken);
    } catch {
      showError('Could not load inventory.');
    }
  }, [accessToken, fetchInventory, showError]);

  useEffect(() => {
    if (items.length === 0) void load();
  }, [items.length, load]);

  const product = items.find((p) => p.id === id);

  const hasPhysical = product?.inventories.some((i) => i.inventoryCategory === 'physical');
  const Icon = hasPhysical ? Package : Zap;

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
          <PageHeader title="Stock Detail" showBack onBack={() => router.back()} />

          {isLoading && !product ? (
            <View style={styles.centeredState}>
              <ActivityIndicator color={BrandColors.primary} />
            </View>
          ) : !product ? (
            <View style={styles.centeredState}>
              <ThemedText themeColor="textSecondary">Product not found.</ThemedText>
            </View>
          ) : (
            <>
              {/* Product info card */}
              <View style={styles.productCard}>
                <View style={styles.productCardHeader}>
                  <View style={styles.iconShell}>
                    {product.photoUrl ? (
                      <Image source={{ uri: product.photoUrl }} style={styles.productImage} />
                    ) : (
                      <Icon size={26} color="#000" strokeWidth={2} />
                    )}
                  </View>
                  <View style={styles.productMeta}>
                    <ThemedText style={styles.productName}>{product.name}</ThemedText>
                    {product.description ? (
                      <ThemedText themeColor="textSecondary" style={styles.productDescription}>
                        {product.description}
                      </ThemedText>
                    ) : null}
                  </View>
                </View>
                <View style={styles.productStats}>
                  <View style={[styles.badge, product.inStock ? styles.badgeIn : styles.badgeOut]}>
                    <View style={[styles.dot, product.inStock ? styles.dotIn : styles.dotOut]} />
                    <Text style={[styles.badgeText, product.inStock ? styles.badgeTextIn : styles.badgeTextOut]}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </Text>
                  </View>
                  <ThemedText themeColor="textSecondary" style={styles.totalQty}>
                    {hasPhysical
                      ? `${product.totalQuantity} ${product.inventories.find((i) => i.inventoryCategory === 'physical')?.unitMetric ?? 'pcs'} total`
                      : 'Service'}
                  </ThemedText>
                </View>
              </View>

              {/* Inventory records */}
              <SectionLabel>Inventory Records</SectionLabel>

              {product.inventories.length === 0 ? (
                <View style={styles.centeredState}>
                  <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                    No inventory records yet.
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.recordsList}>
                  {product.inventories.map((inv) => (
                    <View key={inv.id} style={styles.recordRow}>
                      <View style={styles.recordLeft}>
                        <ThemedText style={styles.recordQty}>{quantityLabel(inv)}</ThemedText>
                        <View style={styles.recordPrices}>
                          <ThemedText themeColor="textSecondary" style={styles.recordPrice}>
                            BP {formatKes(inv.unitPurchasePrice)}
                          </ThemedText>
                          <ThemedText style={styles.recordPrice}>
                            SP {formatKes(inv.unitSalePrice)}
                          </ThemedText>
                        </View>
                        <View style={styles.recordMeta}>
                          {inv.priceIncludesTax ? (
                            <View style={styles.taxBadge}>
                              <Text style={styles.taxBadgeText}>Tax incl.</Text>
                            </View>
                          ) : null}
                          <ThemedText themeColor="textSecondary" style={styles.recordDate}>
                            {formatDaysAgo(inv.createdAt)}
                          </ThemedText>
                        </View>
                      </View>
                      <Pressable
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="Edit inventory record"
                        onPress={() =>
                          router.push(
                            `/inventory/edit/${inv.id}?productId=${id}` as Href,
                          )
                        }
                        style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}>
                        <Pencil size={16} color={BrandColors.primary} strokeWidth={2.2} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              <AppButton
                icon={Plus}
                label="Add Inventory"
                fullWidth
                onPress={() => router.push(`/inventory/new?productId=${id}` as Href)}
              />
            </>
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
  centeredState: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCard: {
    borderWidth: 1,
    borderColor: '#D8DDE0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: Spacing.three,
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  productCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconShell: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    flexShrink: 0,
  },
  productImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  productMeta: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
  },
  productDescription: {
    fontSize: 12,
    fontWeight: '400',
  },
  productStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeIn: { backgroundColor: '#f0fdf4' },
  badgeOut: { backgroundColor: '#fff1f2' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotIn: { backgroundColor: '#22c55e' },
  dotOut: { backgroundColor: '#f43f5e' },
  badgeText: { fontSize: 12, fontWeight: '500' },
  badgeTextIn: { color: '#16a34a' },
  badgeTextOut: { color: '#e11d48' },
  totalQty: {
    fontSize: 12,
    fontWeight: '500',
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
  recordsList: {
    borderWidth: 1,
    borderColor: '#D8DDE0',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  recordLeft: {
    flex: 1,
    gap: 4,
  },
  recordQty: {
    fontSize: 14,
    fontWeight: '600',
  },
  recordPrices: {
    flexDirection: 'row',
    gap: 12,
  },
  recordPrice: {
    fontSize: 12,
    fontWeight: '400',
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taxBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  taxBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3B82F6',
  },
  recordDate: {
    fontSize: 11,
    fontWeight: '400',
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F7EE',
    flexShrink: 0,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
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
