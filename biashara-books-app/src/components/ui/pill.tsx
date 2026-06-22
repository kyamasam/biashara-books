import type { ComponentProps, ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, X } from 'lucide-react-native';

import { BrandColors, Spacing } from '@/constants/theme';

export type PillIcon = ComponentType<ComponentProps<typeof X>>;

export type PillVariant = 'filled' | 'outlined' | 'soft';
export type PillSize = 'sm' | 'md' | 'lg';
export type PillColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

type PillProps = Omit<ComponentProps<typeof Pressable>, 'style' | 'children'> & {
  label: string;
  variant?: PillVariant;
  size?: PillSize;
  color?: PillColor;
  selected?: boolean;
  icon?: PillIcon;
  onDelete?: () => void;
};

type ColorTokens = {
  filledBg: string;
  filledText: string;
  outlinedBorder: string;
  outlinedText: string;
  softBg: string;
  softText: string;
  selectedBg: string;
  selectedText: string;
};

// Calmer, more modern palette — muted/desaturated fills instead of
// saturated "alert" colors, soft low-contrast borders.
const COLOR_TOKENS: Record<PillColor, ColorTokens> = {
  default: {
    filledBg: '#3A3842',
    filledText: '#EDEAF2',
    outlinedBorder: 'rgba(184, 179, 194, 0.28)',
    outlinedText: '#B8B3C2',
    softBg: '#27252E',
    softText: '#B8B3C2',
    selectedBg: '#EDEAF2',
    selectedText: '#26242C',
  },
  primary: {
    filledBg: BrandColors.primary,
    filledText: '#FFFFFF',
    outlinedBorder: 'rgba(64, 171, 60, 0.22)',
    outlinedText: BrandColors.primary,
    softBg: 'rgba(64, 171, 60, 0.14)',
    softText: BrandColors.primary,
    selectedBg: BrandColors.primary,
    selectedText: '#FFFFFF',
  },
  secondary: {
    filledBg: '#6552C8',
    filledText: '#FFFFFF',
    outlinedBorder: 'rgba(101, 82, 200, 0.22)',
    outlinedText: '#A79AF0',
    softBg: 'rgba(101, 82, 200, 0.16)',
    softText: '#A79AF0',
    selectedBg: '#6552C8',
    selectedText: '#FFFFFF',
  },
  success: {
    filledBg: '#3C9C4A',
    filledText: '#FFFFFF',
    outlinedBorder: 'rgba(60, 156, 74, 0.22)',
    outlinedText: '#6BC478',
    softBg: 'rgba(60, 156, 74, 0.16)',
    softText: '#6BC478',
    selectedBg: '#3C9C4A',
    selectedText: '#FFFFFF',
  },
  warning: {
    filledBg: '#D98B1E',
    filledText: '#FFFFFF',
    outlinedBorder: 'rgba(217, 139, 30, 0.22)',
    outlinedText: '#E8A94A',
    softBg: 'rgba(217, 139, 30, 0.16)',
    softText: '#E8A94A',
    selectedBg: '#D98B1E',
    selectedText: '#FFFFFF',
  },
  error: {
    filledBg: '#D14B4B',
    filledText: '#FFFFFF',
    outlinedBorder: 'rgba(209, 75, 75, 0.22)',
    outlinedText: '#E37C7C',
    softBg: 'rgba(209, 75, 75, 0.16)',
    softText: '#E37C7C',
    selectedBg: '#D14B4B',
    selectedText: '#FFFFFF',
  },
  info: {
    filledBg: '#2E96D6',
    filledText: '#FFFFFF',
    outlinedBorder: 'rgba(46, 150, 214, 0.22)',
    outlinedText: '#6BBBE8',
    softBg: 'rgba(46, 150, 214, 0.16)',
    softText: '#6BBBE8',
    selectedBg: '#2E96D6',
    selectedText: '#FFFFFF',
  },
};

// Mobile-tuned scale — overall ~25-30% smaller than before, with a true
// pill radius (half of minHeight) instead of a fixed rounded-rect.
const SIZE_TOKENS: Record<
  PillSize,
  {
    minHeight: number;
    paddingHorizontal: number;
    iconSize: number;
    fontSize: number;
    lineHeight: number;
    gap: number;
    borderRadius: number;
  }
> = {
  sm: {
    minHeight: 22,
    paddingHorizontal: 9,
    iconSize: 11,
    fontSize: 11,
    lineHeight: 14,
    gap: 4,
    borderRadius: 11,
  },
  md: {
    minHeight: 28,
    paddingHorizontal: 12,
    iconSize: 13,
    fontSize: 12.5,
    lineHeight: 16,
    gap: Spacing.one,
    borderRadius: 14,
  },
  lg: {
    minHeight: 34,
    paddingHorizontal: 14,
    iconSize: 15,
    fontSize: 14,
    lineHeight: 18,
    gap: Spacing.one,
    borderRadius: 17,
  },
};

export function Pill({
  label,
  variant = 'filled',
  size = 'md',
  color = 'default',
  selected = false,
  icon: Icon,
  onDelete,
  disabled,
  ...props
}: PillProps) {
  const isDisabled = Boolean(disabled);
  const sizeTokens = SIZE_TOKENS[size];
  const colorTokens = COLOR_TOKENS[color];

  const backgroundColor = selected
    ? colorTokens.selectedBg
    : variant === 'filled'
      ? colorTokens.filledBg
      : variant === 'soft'
        ? colorTokens.softBg
        : 'transparent';

  const textColor = selected
    ? colorTokens.selectedText
    : variant === 'filled'
      ? colorTokens.filledText
      : variant === 'soft'
        ? colorTokens.softText
        : colorTokens.outlinedText;

  // Only the outlined variant (and unselected state) shows a border.
  // Filled and soft pills rely on their fill color for definition.
  const showBorder = variant === 'outlined' && !selected;
  const borderColor = colorTokens.outlinedBorder;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, selected }}
      disabled={isDisabled}
      style={[
        styles.base,
        {
          minHeight: sizeTokens.minHeight,
          paddingHorizontal: sizeTokens.paddingHorizontal,
          borderRadius: sizeTokens.borderRadius,
          borderWidth: showBorder ? StyleSheet.hairlineWidth : 0,
          borderColor,
          backgroundColor,
        },
        isDisabled && styles.dimmed,
      ]}
      {...props}>
      {({ pressed }) => (
        <View style={[styles.inner, { gap: sizeTokens.gap }, pressed && styles.dimmed]}>
          {selected ? (
            <Check size={sizeTokens.iconSize} color={textColor} strokeWidth={2.6} />
          ) : Icon ? (
            <Icon size={sizeTokens.iconSize} color={textColor} strokeWidth={2.4} />
          ) : null}
          <Text
            numberOfLines={1}
            style={[
              styles.label,
              {
                color: textColor,
                fontSize: sizeTokens.fontSize,
                lineHeight: sizeTokens.lineHeight,
              },
            ]}>
            {label}
          </Text>
          {onDelete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${label}`}
              hitSlop={8}
              onPress={onDelete}
              style={styles.deleteButton}>
              <X size={sizeTokens.iconSize} color={textColor} strokeWidth={2.6} />
            </Pressable>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  inner: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    flexShrink: 1,
    fontWeight: '600',
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: {
    opacity: 0.68,
  },
});