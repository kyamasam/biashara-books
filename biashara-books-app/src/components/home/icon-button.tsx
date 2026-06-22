import { Pressable, View, ViewStyle } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';

type IconButtonProps = {
  name: AppIconName;
  accessibilityLabel: string;
  badge?: boolean;
  size?: number;
  style?: ViewStyle;
  onPress?: () => void;
};

export function IconButton({
  name,
  accessibilityLabel,
  badge,
  size = 34,
  style,
  onPress,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="items-center justify-center"
      style={({ pressed }) => [{ width: size, height: size }, pressed && { opacity: 0.65 }, style]}>
      <AppIcon name={name} size={24} color="#111111" strokeWidth={2.6} />
      {badge ? <View className="absolute right-1 top-[5px] h-2 w-2 rounded-full bg-[#ff3b30]" /> : null}
    </Pressable>
  );
}
