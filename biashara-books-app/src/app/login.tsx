import { useAuth } from '@/context/auth-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
  const { lastLoginInfo } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');

  function handleQuickLogin() {
    if (!lastLoginInfo) return;
    router.push({
      pathname: '/pin-login',
      params: {
        phone_number: lastLoginInfo.phoneNumber,
        business_name: lastLoginInfo.businessName,
      },
    });
  }

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
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={styles.backButton} onPress={() => router.push('/welcome')}>
            <ChevronLeft size={24} color="#000" />
            <Text style={styles.backBtnText}>Back</Text>
          </Pressable>

          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>SM</Text>
              </View>

              <Text style={styles.title}>
                ENTER PHONE NUMBER
              </Text>

            </View>

            {lastLoginInfo && (
              <>
                <Pressable style={styles.prevCard} onPress={handleQuickLogin}>
                  <View style={styles.prevCardText}>
                    <Text style={styles.prevCardTitle}>Previously logged in</Text>
                    <Text style={styles.prevCardBusiness}>{lastLoginInfo.businessName}</Text>
                    <Text style={styles.prevCardPhone}>+254 {lastLoginInfo.phoneNumber}</Text>
                  </View>
                  <Text style={styles.prevCardCta}>CONTINUE →</Text>
                </Pressable>
                <Text style={styles.divider}>— or enter a different number —</Text>
              </>
            )}

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
        </ScrollView>
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
    flexGrow: 1,
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
    marginTop: 32,
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
  prevCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginTop: 32,
    marginBottom: 0,
    backgroundColor: '#F9FAFB',
  },
  prevCardText: {
    gap: 2,
  },
  prevCardTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  prevCardBusiness: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  prevCardPhone: {
    fontSize: 13,
    fontWeight: '400',
    color: '#374151',
  },
  prevCardCta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
    letterSpacing: 0.5,
  },
  divider: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginVertical: 16,
  },
  backBtnText: {
    fontWeight: '800',
  },
  backButton: {
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    gap: '8',
    alignSelf: 'flex-start',
  },

});
