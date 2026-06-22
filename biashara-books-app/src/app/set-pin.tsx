import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import { PinPad } from '@/components/pin-pad';
import { useAuth } from '@/context/auth-context';
import { BrandColors } from '@/constants/theme';

type Step = 'enter' | 'confirm';

export default function SetPinScreen() {
  const { setPin } = useAuth();
  const [step, setStep] = useState<Step>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  function handleEnterComplete(pin: string) {
    setFirstPin(pin);
    setStep('confirm');
  }

  async function handleConfirmComplete(pin: string) {
    if (pin !== firstPin) {
      Alert.alert('PINs do not match', 'Please try again.');
      setFirstPin('');
      setConfirmPin('');
      setStep('enter');
      return;
    }
    setLoading(true);
    try {
      await setPin(firstPin, pin);
      Alert.alert('Success', 'Your PIN has been set.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to set PIN';
      Alert.alert('Error', message);
      setFirstPin('');
      setConfirmPin('');
      setStep('enter');
    } finally {
      setLoading(false);
    }
  }

  const isEnter = step === 'enter';

  return (
    <View className="flex-1 bg-white justify-center items-center px-6">
      <View className="items-center mb-10">
        <Text className="text-2xl font-bold text-black mb-2">
          {isEnter ? 'Create a PIN' : 'Confirm your PIN'}
        </Text>
        <Text className="text-sm text-gray-500 text-center">
          {isEnter
            ? 'Choose a 4-digit PIN to quickly access your account'
            : 'Enter your PIN again to confirm'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={BrandColors.primary} />
      ) : isEnter ? (
        <PinPad
          value={firstPin}
          onChange={setFirstPin}
          onComplete={handleEnterComplete}
        />
      ) : (
        <PinPad
          value={confirmPin}
          onChange={setConfirmPin}
          onComplete={handleConfirmComplete}
        />
      )}

      {!loading && step === 'confirm' && (
        <Pressable
          className="mt-10"
          onPress={() => {
            setStep('enter');
            setFirstPin('');
            setConfirmPin('');
          }}
        >
          <Text className="text-sm text-gray-500">Start over</Text>
        </Pressable>
      )}
    </View>
  );
}
