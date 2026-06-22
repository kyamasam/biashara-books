import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { IconButton } from '@/components/home/icon-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type PageHeaderProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: ReactNode;
};

export function PageHeader({ title, showBack, onBack, actions }: PageHeaderProps) {
  const router = useRouter();

  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  }

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {showBack ? (
          <IconButton name="arrow-left" accessibilityLabel="Go back" onPress={handleBack} />
        ) : null}
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>

      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
