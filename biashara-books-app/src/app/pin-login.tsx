import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PinPad } from '@/components/pin-pad';
import { BrandColors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';

const OPERATOR_ID = 'SM';
const BUSINESS_NAME = 'FASTDUKA SOFTWARE';

export default function PinLoginScreen() {
  const { phone_number } = useLocalSearchParams<{ phone_number: string }>();
  const { loginWithPin } = useAuth();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleComplete(completedPin: string) {
    if (!phone_number) {
      Alert.alert('Missing phone number', 'Please enter your phone number again.');
      router.replace('/login');
      return;
    }

    setLoading(true);
    try {
      await loginWithPin(phone_number, completedPin);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      Alert.alert('Incorrect PIN', message);
      setPin('');
    } finally {
      setLoading(false);
    }
  }

  function handleChangePin() {
    Alert.alert('Change PIN', 'Log in first, then change your PIN from your account settings.');
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{OPERATOR_ID}</Text>
          </View>

          <View style={styles.operatorRow}>
            <Text style={styles.operatorLabel}>OPERATOR ID: {OPERATOR_ID}</Text>
            <Text style={styles.chevron}> ˅</Text>
          </View>

          <View style={styles.businessRow}>
            <Text style={styles.businessName}>{BUSINESS_NAME}</Text>
            {!!phone_number && <Text style={styles.phoneNumber}> {phone_number}</Text>}
          </View>
        </View>

        {/* PIN section */}
        <View style={styles.pinSection}>
          <Text style={styles.pinLabel}>ENTER PIN:</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BrandColors.primary} />
            </View>
          ) : (
            <PinPad
              value={pin}
              onChange={setPin}
              onComplete={handleComplete}
              disabled={loading}
              variant="login"
              accessory={
                <View style={styles.accessoryRow}>
                  <Pressable
                    style={styles.accessoryBtn}
                    onPress={() => router.replace('/login')}
                  >
                    <Text style={styles.accessoryBtnText}>CHANGE ACCOUNT</Text>
                  </Pressable>
                  <Pressable
                    style={styles.accessoryBtn}
                    onPress={handleChangePin}
                  >
                    <Text style={styles.accessoryBtnText}>CHANGE PIN</Text>
                  </Pressable>
                </View>
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  avatar: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#3B82F6',
  },
  operatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  operatorLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    letterSpacing: 0.5,
  },
  chevron: {
    fontSize: 16,
    color: '#000000',
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.5,
  },
  phoneNumber: {
    fontSize: 13,
    fontWeight: '400',
    color: '#000000',
  },
  pinSection: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  pinLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#000000',
    letterSpacing: 1,
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  accessoryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  accessoryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
});
