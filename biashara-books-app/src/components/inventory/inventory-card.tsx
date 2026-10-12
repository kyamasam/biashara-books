import { ChevronDown, ChevronRight, Package, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { ProductInventoryResponse } from '@/types/product';

type Props = {
  item: ProductInventoryResponse;
  onPress?: () => void;
};

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

function quantityLabel(inventoryCategory: string, inventoryType: string, quantity: number | null, unitMetric: string | null) {
  if (inventoryCategory === 'service') return 'Service';
  if (inventoryType === 'unit') return `${quantity ?? 0} ${unitMetric ?? ''}`.trim();
  return `${quantity ?? 0} pcs`;
}

export function InventoryCard({ item, onPress }: Props) {
  const [expanded, setExpanded] = useState(false);
  const hasPhysical = item.inventories.some((i) => i.inventoryCategory === 'physical');
  const Icon = hasPhysical ? Package : Zap;

  const totalLabel = hasPhysical
    ? `${item.totalQuantity} ${item.inventories.find((i) => i.inventoryCategory === 'physical')?.unitMetric ?? 'pcs'}`
    : 'Service';

  return (
    <View style={styles.card}>
      {/* Header row */}
      <Pressable
        style={styles.header}
        onPress={onPress ?? (() => setExpanded((v) => !v))}
        accessibilityRole="button"
        accessibilityState={{ expanded }}>
        <View style={styles.iconShell}>
          {item.photoUrl ? (
            <Image source={{ uri: item.photoUrl }} style={styles.productImage} />
          ) : (
            <Icon size={22} color="#000" strokeWidth={2.2} />
          )}
        </View>

        <View style={styles.body}>
          <ThemedText style={styles.name} numberOfLines={1}>
            {item.name}
          </ThemedText>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, item.inStock ? styles.badgeIn : styles.badgeOut]}>
              <View style={[styles.dot, item.inStock ? styles.dotIn : styles.dotOut]} />
              <ThemedText style={[styles.badgeText, item.inStock ? styles.badgeTextIn : styles.badgeTextOut]}>
                {item.inStock ? 'In Stock' : 'Out of Stock'}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.right}>
          <ThemedText style={styles.totalQty}>{totalLabel}</ThemedText>
          {onPress ? (
            <ChevronRight size={16} color="#9eaba2" strokeWidth={2} />
          ) : (
            <ChevronDown
              size={16}
              color="#9eaba2"
              strokeWidth={2}
              style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
            />
          )}
        </View>
      </Pressable>

      {/* Accordion body */}
      {expanded && item.inventories.length > 0 && (
        <View style={styles.accordionBody}>
          {item.inventories.map((inv, idx) => (
            <View key={inv.id} style={[styles.invRow, idx > 0 && styles.invRowDivider]}>
              <ThemedText style={styles.invQty}>
                {quantityLabel(inv.inventoryCategory, inv.inventoryType, inv.quantity, inv.unitMetric)}
              </ThemedText>
              <View style={styles.invPrices}>
                <ThemedText themeColor="textSecondary" style={styles.invPrice}>
                  BP {formatKes(inv.unitPurchasePrice)}
                </ThemedText>
                <ThemedText style={styles.invPrice}>
                  SP {formatKes(inv.unitSalePrice)}
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.invDate}>
                  {formatDaysAgo(inv.createdAt)}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9d9d9',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  iconShell: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  name: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeIn: {
    backgroundColor: '#f0fdf4',
  },
  badgeOut: {
    backgroundColor: '#fff1f2',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotIn: {
    backgroundColor: '#22c55e',
  },
  dotOut: {
    backgroundColor: '#f43f5e',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  badgeTextIn: {
    color: '#16a34a',
  },
  badgeTextOut: {
    color: '#e11d48',
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  totalQty: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
  accordionBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 0,
  },
  invRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  invRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#f3f4f6',
  },
  invQty: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  invPrices: {
    flexDirection: 'row',
    gap: 12,
  },
  invPrice: {
    fontSize: 12,
    fontWeight: '400',
  },
  invDate: {
    fontSize: 11,
    fontWeight: '400',
  },
});
