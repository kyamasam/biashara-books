import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import type { HomeAction } from '@/components/home/home-data';
import { ThemedText } from '@/components/themed-text';
import { AppIcon } from '@/components/ui/app-icon';
import { Spacing } from '@/constants/theme';

type QuickActionsProps = {
  actions: HomeAction[];
};

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <View style={styles.actions}>
      {actions.map((action) => (
        <Link key={action.label} href={action.href} asChild>
          <Pressable
            accessibilityLabel={action.label}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
            <View style={[styles.iconCircle, { backgroundColor: action.color }]}>
              <AppIcon name={action.icon} size={18} color="#ffffff" strokeWidth={2.2} />
            </View>
            <ThemedText themeColor="textSecondary" style={styles.actionLabel}>
              {action.label}
            </ThemedText>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.four
  },
  action: {
    minWidth: 44,
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: 500,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.74,
  },
});
