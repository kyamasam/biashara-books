import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/home/avatar';
import { IconButton } from '@/components/home/icon-button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export function HomeHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.profile}>
        <Avatar />
        <View style={styles.profileText}>
          <ThemedText style={styles.businessName}>Fastduka Software</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.ownerName}>
            Samuel Muasya
          </ThemedText>
        </View>
      </View>

      <View style={styles.headerActions}>
        <IconButton name="qr" accessibilityLabel="Scan QR code" />
        <IconButton name="notifications" accessibilityLabel="Notifications" badge />
      </View>
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
  profile: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  profileText: {
    minWidth: 0,
    gap: 1,
  },
  businessName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 700,
  },
  ownerName: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
