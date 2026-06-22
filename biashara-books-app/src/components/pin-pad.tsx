import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/theme';

interface PinPadProps {
  value: string;
  onChange: (value: string) => void;
  onComplete: (pin: string) => void;
  length?: number;
  disabled?: boolean;
  variant?: 'compact' | 'login';
  accessory?: ReactNode;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export function PinPad({
  value,
  onChange,
  onComplete,
  length = 4,
  disabled = false,
  variant = 'compact',
  accessory,
}: PinPadProps) {
  function handleKey(key: string) {
    if (disabled) return;
    if (key === 'del') {
      onChange(value.slice(0, -1));
      return;
    }
    if (!key) return;
    const next = value + key;
    if (next.length > length) return;
    onChange(next);
    if (next.length === length) {
      onComplete(next);
    }
  }

  const isLogin = variant === 'login';

  if (!isLogin) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactDots}>
          {Array.from({ length }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.compactDot,
                {
                  backgroundColor: i < value.length ? BrandColors.primary : 'transparent',
                  borderColor: i < value.length ? BrandColors.primary : '#DADADA',
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.compactGrid}>
          {KEYS.map((key, index) => {
            if (!key) return <View key={index} style={styles.compactKeyEmpty} />;
            return (
              <Pressable
                key={index}
                style={key === 'del' ? styles.compactKeyDel : styles.compactKeyDefault}
                onPress={() => handleKey(key)}
                disabled={disabled}
              >
                <Text style={key === 'del' ? styles.compactKeyTextDel : styles.compactKeyText}>
                  {key === 'del' ? '⌫' : key}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.loginContainer}>
      <View style={styles.loginDots}>
        {Array.from({ length }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.loginDot,
              {
                backgroundColor: i < value.length ? BrandColors.primary : 'transparent',
                borderColor: i < value.length ? BrandColors.primary : '#DADADA',
              },
            ]}
          />
        ))}
      </View>

      {accessory ? <View style={styles.accessory}>{accessory}</View> : null}

      <View style={styles.loginGrid}>
        {KEYS.map((key, index) => {
          if (!key) return <View key={index} style={styles.loginKeyEmpty} />;
          return (
            <Pressable
              key={index}
              style={styles.loginKey}
              onPress={() => handleKey(key)}
              disabled={disabled}
            >
              {key === 'del' ? (
                <Text style={styles.loginDeleteKey}>⌫</Text>
              ) : (
                <Text style={styles.loginKeyText}>{key}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // compact variant
  compactContainer: {
    alignItems: 'center',
    gap: 24,
  },
  compactDots: {
    flexDirection: 'row',
    gap: 16,
  },
  compactDot: {
    height: 16,
    width: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  compactGrid: {
    width: 288,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  compactKeyEmpty: {
    height: 56,
    width: 80,
  },
  compactKey: {
    height: 56,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  compactKeyDefault: {
    height: 56,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  compactKeyDel: {
    height: 56,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
  },
  compactKeyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666666',
  },
  compactKeyTextDel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#818196',
  },

  // login variant
  loginContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loginDots: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
  },
  loginDot: {
    height: 44,
    width: 44,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  accessory: {
    width: '100%',
    marginBottom: 8,
  },
  loginGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  loginKeyEmpty: {
    height: 72,
    width: '33.33%',
  },
  loginKey: {
    height: 72,
    width: '33.33%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginKeyText: {
    fontSize: 36,
    fontWeight: '300',
    color: '#444444',
  },
  loginDeleteKey: {
    fontSize: 28,
    color: '#818196',
  },
});
