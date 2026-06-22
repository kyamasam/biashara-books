import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from 'expo-router/ui';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { AppIcon, type AppIconName } from '@/components/ui/app-icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TAB_ITEMS = [
  {
    name: 'home',
    href: '/',
    label: 'Home',
    icon: 'home',
    selectedIcon: 'home',
  },
  {
    name: 'pos',
    href: '/sale',
    label: 'Pos',
    icon: 'pos',
    selectedIcon: 'pos',
  },
  // {
  //   name: 'sale',
  //   href: '/sale',
  //   label: 'Sale',
  //   icon: 'sale',
  //   selectedIcon: 'sale',
  //   featured: true,
  // },
  {
    name: 'books',
    href: '/books',
    label: 'Books',
    icon: 'books',
    selectedIcon: 'books',
  },
  {
    name: 'loans',
    href: '/loans',
    label: 'Loans',
    icon: 'loans',
    selectedIcon: 'loans',
  },
] as const;

type BottomMenuItemProps = TabTriggerSlotProps & {
  label: string;
  icon: AppIconName;
  selectedIcon: AppIconName;
  featured?: boolean;
};

export default function BottomTabMenu() {
  return (
    <Tabs style={styles.tabs}>
      <TabSlot style={styles.tabSlot} />
      <TabList asChild>
        <BottomMenuBar>
          {TAB_ITEMS.map((item) => (
            <TabTrigger key={item.name} name={item.name} href={item.href} asChild>
              <BottomMenuItem {...item} />
            </TabTrigger>
          ))}
          <TabTrigger name="expenses" href="/expenses" style={{ display: 'none' }} />
        </BottomMenuBar>
      </TabList>
    </Tabs>
  );
}

export function BottomMenuItem({
  label,
  icon,
  selectedIcon,
  featured,
  isFocused,
  ...props
}: BottomMenuItemProps) {
  const activeColor = '#2fc66f'; // Exact screenshot green tone
  const inactiveColor = '#9eaba2'; // Precision muted gray-green
  const iconColor = isFocused ? activeColor : inactiveColor;

  return (
    <Pressable
      {...props}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.menuItem,
        featured && styles.featuredMenuItem,
        pressed && styles.pressed,
      ]}>
      <View style={[styles.itemContent, featured && styles.featuredItemContent]}>
        <View
          style={[
            featured ? styles.featuredIconShell : styles.iconShell,
            featured && { backgroundColor: activeColor },
          ]}>
          <AppIcon
            name={isFocused ? selectedIcon : icon}
            size={featured ? 22 : 20}
            color={featured ? '#ffffff' : iconColor}
            strokeWidth={2.2}
          />
        </View>

        <ThemedText
          type="small"
          style={[
            styles.label,
            { color: isFocused ? activeColor : inactiveColor }
          ]}>
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export function BottomMenuBar(props: TabListProps) {
  const insets = useSafeAreaInsets();

  const barHeight = 60;
  const center = SCREEN_WIDTH / 2;

  const notchHalfWidth = 58;

  const dPath = `
    M 0 0
    L ${center - notchHalfWidth} 0
    L ${SCREEN_WIDTH} 0
    L ${SCREEN_WIDTH} ${barHeight + insets.bottom}
    L 0 ${barHeight + insets.bottom}
    Z
  `;

  return (
    <View style={[styles.menuWrapper, { bottom: 0, height: barHeight + insets.bottom }]}>
      <View style={styles.svgContainer}>
        <Svg width={SCREEN_WIDTH} height={barHeight + insets.bottom}>
          <Path
            d={dPath}
            fill="#ffffff"
            stroke="#e2e8f0"
            strokeWidth={1.2}
          />
        </Svg>
      </View>

      <View style={[styles.menuContainer, { paddingBottom: insets.bottom }]}>
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flex: 1,
  },
  tabSlot: {
    flex: 1,
  },
  menuWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingLeft: 16,
    paddingRight: 16
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -4 },
    elevation: 5,
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    height: '100%',
  },
  menuItem: {
    flex: 1,
    alignItems: 'center',
  },
  featuredMenuItem: {
    zIndex: 50,
  },
  itemContent: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  featuredItemContent: {
    justifyContent: 'flex-start',
    paddingTop: 0,
    marginTop: -20,
  },
  iconShell: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  featuredIconShell: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    shadowColor: '#2fc66f',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '400',
    textAlign: 'center',
    textTransform: 'capitalize',
    letterSpacing: 0,
  },
  pressed: {
    opacity: 0.85,
  },
});
