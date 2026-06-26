import { Minus, Plus } from 'lucide-react-native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Product } from '@/types/product';

type ProductCardProps = {
  product: Product;
  quantity: number;
  selected: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  width: number;
};

export function ProductCard({
  product,
  quantity,
  selected,
  onIncrement,
  onDecrement,
  width,
}: ProductCardProps) {
  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onIncrement}
      disabled={isOutOfStock}
      style={[styles.card, { width }, selected && styles.cardSelected]}>
      <Image
        source={{ uri: product.imageUrl }}
        style={[styles.image, { width: width - 2, height: width - 2 }]}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.price}>KES {product.price.toLocaleString()}</Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation?.(); onDecrement(); }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}
            style={styles.stepperButton}
            disabled={quantity === 0}>
            <Minus size={14} color="#374151" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation?.(); onIncrement(); }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
            style={styles.stepperButton}
            disabled={isOutOfStock}>
            <Plus size={14} color="#374151" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.stock, isOutOfStock && styles.stockOut]}>
          {isOutOfStock ? 'Out of stock' : `${product.stockQuantity} in stock`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
  },
  cardSelected: {
    borderColor: '#1A6B52',
    borderWidth: 2,
  },
  image: {
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    backgroundColor: '#E5E7EB',
  },
  info: {
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 8,
    gap: 4,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
  },
  price: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
    minWidth: 14,
    textAlign: 'center',
  },
  stock: {
    fontSize: 11,
    color: '#6B7280',
  },
  stockOut: {
    color: '#EF4444',
  },
});
