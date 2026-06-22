import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/button';

const PHONE_PATTERN = /^\d{9,10}$/;

function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, '').replace(/^254/, '').replace(/^0/, '');
}

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');

  function handleContinue() {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    if (!PHONE_PATTERN.test(normalizedPhone)) {
      Alert.alert('Invalid phone number', 'Enter a valid phone number to continue.');
      return;
    }

    router.push({ pathname: '/pin-login', params: { phone_number: normalizedPhone } });
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>SM</Text>
              </View>

              <Text style={styles.title}>
                ENTER PHONE NUMBER
              </Text>
              <Text style={styles.businessName}>
                FASTDUKA SOFTWARE
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <View style={styles.phoneRow}>
                <Text style={styles.countryCode}>+254</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="712345678"
                  placeholderTextColor="#B8B8B8"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  autoComplete="tel"
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                />
              </View>
            </View>
          </View>

          <View style={styles.buttonWrap}>
            <AppButton
              label="NEXT"
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleContinue}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  content: {
    paddingTop: 56,
  },
  header: {
    alignItems: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 48,
    backgroundColor: '#F0F9FF',
  },
  avatarText: {
    color: '#3B82F6',
    fontSize: 30,
    fontWeight: '700',
  },
  title: {
    marginTop: 28,
    textAlign: 'center',
    color: '#000000',
    fontSize: 24,
    fontWeight: '400',
  },
  businessName: {
    marginTop: 12,
    textAlign: 'center',
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    marginTop: 44,
  },
  label: {
    marginBottom: 12,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D1D5DB',
  },
  countryCode: {
    marginRight: 12,
    color: '#6B7280',
    fontSize: 20,
  },
  phoneInput: {
    flex: 1,
    color: '#374151',
    fontSize: 30,
    fontWeight: '300',
  },
  buttonWrap: {
    width: '100%',
  },
});
