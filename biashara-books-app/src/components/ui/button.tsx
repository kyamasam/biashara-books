import { useState, type ComponentProps, type ComponentType } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Spacing } from '@/constants/theme';

type LucideIcon = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';
type IconPosition = 'left' | 'right';

export const PRIMARY_BUTTON_COLOR = '#2FC56D';

type AppButtonProps = Omit<ComponentProps<typeof Pressable>, 'style'> & {
  label?: string;
  variant?: Variant;
  size?: Size;
  color?: string;
  textColor?: string;
  icon?: LucideIcon;
  iconPosition?: IconPosition;
  iconSize?: number;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

const VARIANT_BG: Record<Variant, string> = {
  primary: PRIMARY_BUTTON_COLOR,
  secondary: '#F0F0F3',
  ghost: 'transparent',
  danger: '#DC2626',
};

const VARIANT_TEXT: Record<Variant, string> = {
  primary: '#FFFFFF',
  secondary: '#111111',
  ghost: '#111111',
  danger: '#FFFFFF',
};

const ICON_SIZE: Record<Size, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

const FONT_SIZE: Record<Size, number> = {
  sm: 13,
  md: 15,
  lg: 17,
};

export function AppButton({
  label,
  variant = 'primary',
  size = 'md',
  color,
  textColor,
  icon: Icon,
  iconPosition = 'left',
  iconSize,
  fullWidth = false,
  disabled = false,
  style,
  onPressIn,
  onPressOut,
  ...props
}: AppButtonProps) {
  const [pressed, setPressed] = useState(false);

  const bgColor = color ?? VARIANT_BG[variant];
  const fgColor = textColor ?? VARIANT_TEXT[variant];
  const resolvedIconSize = iconSize ?? ICON_SIZE[size];

  const isIconOnly = Boolean(Icon && !label);

  return (
    <Pressable
      {...props}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPressIn={(event) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      style={[
        styles.button,
        styles[size],
        fullWidth && styles.fullWidth,
        isIconOnly && styles.iconOnly,
        variant === 'ghost' && styles.ghost,
        {
          backgroundColor: bgColor,
          opacity: disabled ? 0.55 : pressed ? 0.75 : 1,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {Icon && iconPosition === 'left' ? (
          <Icon size={resolvedIconSize} color={fgColor} strokeWidth={2.2} />
        ) : null}

        {label ? (
          <Text
            style={[
              styles.label,
              {
                color: fgColor,
                fontSize: FONT_SIZE[size],
              },
            ]}
          >
            {label}
          </Text>
        ) : null}

        {Icon && iconPosition === 'right' ? (
          <Icon size={resolvedIconSize} color={fgColor} strokeWidth={2.2} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },

  label: {
    fontWeight: '600',
  },

  ghost: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },

  iconOnly: {
    aspectRatio: 1,
    paddingHorizontal: 0,
  },

  sm: {
    minHeight: 32,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },

  md: {
    minHeight: 42,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },

  lg: {
    minHeight: 52,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: 16,
  },
});
