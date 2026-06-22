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
  return (
    <View style={[styles.card, { width }, selected && styles.cardSelected]}>
      <Image
        source={{ uri: product.imageUrl }}
        style={[styles.image, { width: width - 2, height: width - 2 }]}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            onPress={onDecrement}
            activeOpacity={0.8}
            style={styles.stepperButton}
            disabled={quantity === 0}>
            <Minus size={12} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity onPress={onIncrement} activeOpacity={0.8} style={styles.stepperButton}>
            <Plus size={12} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        <Text style={styles.price}>KES {product.price.toLocaleString()}</Text>
      </View>
    </View>
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
    borderColor: '#3B82F6',
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
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#22C55E',
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
  price: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
});
