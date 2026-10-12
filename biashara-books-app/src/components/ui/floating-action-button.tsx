import { ReactNode } from 'react';
import { Platform, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Ripple from 'react-native-material-ripple';

interface FloatingActionButtonProps {
  size?: number;
  text?: string;
  textDisable?: boolean;
  textColor?: string;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  iconComponent?: ReactNode;
  backgroundColor?: string;
  shadowColor?: string;
  rippleColor?: string;
  rippleContainerBorderRadius?: number;
  materialShadow?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  shadowStyle?: StyleProp<ViewStyle>;
}

export default function FloatingActionButton({
  size = 50,
  text = '',
  textDisable = false,
  textColor = '#6E9DFB',
  textStyle,
  onPress,
  iconComponent,
  backgroundColor = '#FBFBFD',
  shadowColor = '#B2B2B2',
  rippleColor = 'rgba(110,157,251,1.0)',
  rippleContainerBorderRadius = 35,
  materialShadow = false,
  disabled = false,
  style,
  containerStyle,
  shadowStyle,
}: FloatingActionButtonProps) {
  const buttonStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  const resolvedShadow = materialShadow
    ? Platform.select({
        ios: {
          shadowRadius: 1,
          shadowOpacity: 1,
          shadowOffset: { width: 0, height: 1 },
          shadowColor,
        },
        android: { elevation: 3 },
      })
    : shadowStyle ?? Platform.select({
        ios: {
          shadowRadius: 5,
          shadowOpacity: 0.15,
          shadowOffset: { width: 2, height: 3 },
          shadowColor,
        },
        android: { elevation: 3 },
      });

  return (
    <View style={[styles.container, containerStyle]}>
      <Ripple
        style={[buttonStyle, resolvedShadow, style]}
        onPress={onPress}
        rippleColor={rippleColor}
        rippleContainerBorderRadius={rippleContainerBorderRadius}
        disabled={disabled}>
        {iconComponent ?? null}
      </Ripple>
      {!textDisable && (
        <Text style={[styles.text, { color: textColor }, textStyle]}>{text}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  text: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
});
