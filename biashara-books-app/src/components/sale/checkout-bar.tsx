import { ArrowRight } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PRIMARY_BUTTON_COLOR } from '@/components/ui/button';

type CheckoutBarProps = {
  total: number;
  onCheckout: () => void;
};

export function CheckoutBar({ total, onCheckout }: CheckoutBarProps) {
  return (
    <TouchableOpacity onPress={onCheckout} activeOpacity={0.85} style={styles.button}>
      <Text style={styles.label}>Checkout</Text>
      <View style={styles.right}>
        <Text style={styles.amount}>KES {total.toLocaleString()}</Text>
        <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PRIMARY_BUTTON_COLOR,
    borderRadius: 32,
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
