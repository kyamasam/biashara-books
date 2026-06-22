import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'error' | 'success' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const ACCENT: Record<ToastType, string> = {
  error: '#EF4444',
  success: '#22C55E',
  info: '#3B82F6',
};

function ToastBubble({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  return (
    <Animated.View
      entering={FadeInDown.duration(250).springify()}
      exiting={FadeOutDown.duration(180)}
      style={[styles.toast, { borderLeftColor: ACCENT[item.type] }]}
    >
      <View style={[styles.accent, { backgroundColor: ACCENT[item.type] }]} />
      <Text style={styles.message} numberOfLines={4}>
        {item.message}
      </Text>
      <Pressable onPress={onDismiss} hitSlop={12} style={styles.closeBtn}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>
    </Animated.View>
  );
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View style={[styles.container, { bottom: insets.bottom + 16 }]} pointerEvents="box-none">
      {toasts.map((item) => (
        <ToastBubble key={item.id} item={item} onDismiss={() => onDismiss(item.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 52,
  },
  accent: {
    width: 4,
    alignSelf: 'stretch',
  },
  message: {
    flex: 1,
    color: '#F9FAFB',
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  closeText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});
