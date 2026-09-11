import { IndustryPickerModal } from '@/components/register/IndustryPickerModal';
import { ProgressBar } from '@/components/register/ProgressBar';
import { RegisterFooter } from '@/components/register/RegisterFooter';
import { StepBusinessDetails } from '@/components/register/StepBusinessDetails';
import { StepLocations } from '@/components/register/StepLocations';
import { StepMpesaSetup } from '@/components/register/StepMpesaSetup';
import { StepPhoneNumber } from '@/components/register/StepPhoneNumber';
import { StepSetPin } from '@/components/register/StepSetPin';
import { styles } from '@/components/register/styles';
import { MpesaType, PinStep } from '@/components/register/types';
import { useAuth } from '@/context/auth-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { ScrollView as ScrollViewType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PHONE_PATTERN = /^\d{9,10}$/;

function normalizePhone(value: string) {
  return value.replace(/\D/g, '').replace(/^254/, '').replace(/^0/, '');
}

export default function RegisterScreen() {
  const { register } = useAuth();

  // step 1 — business details
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [showIndustryPicker, setShowIndustryPicker] = useState(false);

  // step 2 — M-PESA setup
  const [mpesaType, setMpesaType] = useState<MpesaType | null>(null);
  const [mpesaNumber, setMpesaNumber] = useState('');

  // step 3 — locations
  const [hasMultipleLocations, setHasMultipleLocations] = useState<boolean | null>(null);
  const [locations, setLocations] = useState<string[]>(['']);
  const locationInputRefs = useRef<(TextInput | null)[]>([]);
  const scrollViewRef = useRef<ScrollViewType>(null);

  // step 4 — phone number
  const [phoneNumber, setPhoneNumber] = useState('');

  // step 5 — set PIN
  const [pinStep, setPinStep] = useState<PinStep>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(1);

  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      if (step === 2 || step === 3) {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    });
    return () => sub.remove();
  }, [step]);

  function goBack() {
    if (step === 1) {
      router.replace('/welcome');
    } else {
      setStep((s) => s - 1);
    }
  }

  function handleStep1Next() {
    if (!businessName.trim()) {
      Alert.alert('Required', 'Please enter your business name.');
      return;
    }
    if (!industry) {
      Alert.alert('Required', 'Please select your industry.');
      return;
    }
    setStep(2);
  }

  function handleStep2Next() {
    if (mpesaType === 'paybill' || mpesaType === 'till') {
      if (!mpesaNumber.trim()) {
        Alert.alert('Required', `Please enter your ${mpesaType === 'paybill' ? 'business' : 'till'} number.`);
        return;
      }
    }
    setStep(3);
  }

  function addLocation() {
    setLocations((prev) => {
      const next = [...prev, ''];
      setTimeout(() => {
        locationInputRefs.current[next.length - 1]?.focus();
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return next;
    });
  }


  function updateLocation(index: number, value: string) {
    setLocations((prev) => prev.map((l, i) => (i === index ? value : l)));
  }

  function removeLocation(index: number) {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  }

  function handleStep3Next() {
    if (hasMultipleLocations === null) {
      Alert.alert('Required', 'Please select whether you have one or multiple locations.');
      return;
    }
    if (hasMultipleLocations) {
      const filled = locations.filter((l) => l.trim());
      if (filled.length === 0) {
        Alert.alert('Required', 'Add at least one location name.');
        return;
      }
    }
    setStep(4);
  }

  function handleStep4Next() {
    const normalized = normalizePhone(phoneNumber);
    if (!PHONE_PATTERN.test(normalized)) {
      Alert.alert('Invalid number', 'Enter a valid Kenyan phone number.');
      return;
    }
    setStep(5);
  }

  function handlePinEnter(pin: string) {
    setFirstPin(pin);
    setPinStep('confirm');
  }

  async function handlePinConfirm(pin: string) {
    if (pin !== firstPin) {
      Alert.alert('PINs do not match', 'Please try again.');
      setFirstPin('');
      setConfirmPin('');
      setPinStep('enter');
      return;
    }
    setLoading(true);
    try {
      await register({
        businessName: businessName.trim(),
        industry,
        mpesaType,
        mpesaNumber: mpesaNumber.trim() || null,
        locations: hasMultipleLocations ? locations.filter((l) => l.trim()) : [],
        phoneNumber: normalizePhone(phoneNumber),
        pin,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      Alert.alert('Error', message);
      setFirstPin('');
      setConfirmPin('');
      setPinStep('enter');
    } finally {
      setLoading(false);
    }
  }

  function handleNextForStep() {
    if (step === 1) return handleStep1Next();
    if (step === 2) return handleStep2Next();
    if (step === 3) return handleStep3Next();
    if (step === 4) return handleStep4Next();
  }

  function handleMpesaTypeChange(type: MpesaType) {
    setMpesaType(type);
    setMpesaNumber('');
  }

  function handleSetHasMultiple(value: boolean) {
    setHasMultipleLocations(value);
    if (value && locations.length === 0) setLocations(['']);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={goBack}>
              <ChevronLeft size={24} color="#000" />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
            <ProgressBar step={step} />
          </View>

          {step < 5 && (
            <>
              <ScrollView
                ref={scrollViewRef}
                style={styles.scrollContent}
                contentContainerStyle={styles.scrollContentInner}
                keyboardShouldPersistTaps="handled"
              >
                {step === 1 && (
                  <StepBusinessDetails
                    businessName={businessName}
                    onBusinessNameChange={setBusinessName}
                    industry={industry}
                    onOpenIndustryPicker={() => setShowIndustryPicker(true)}
                  />
                )}

                {step === 2 && (
                  <StepMpesaSetup
                    mpesaType={mpesaType}
                    mpesaNumber={mpesaNumber}
                    onMpesaTypeChange={handleMpesaTypeChange}
                    onMpesaNumberChange={setMpesaNumber}
                  />
                )}

                {step === 3 && (
                  <StepLocations
                    hasMultipleLocations={hasMultipleLocations}
                    locations={locations}
                    locationInputRefs={locationInputRefs}
                    onSetHasMultiple={handleSetHasMultiple}
                    onAddLocation={addLocation}
                    onUpdateLocation={updateLocation}
                    onRemoveLocation={removeLocation}
                  />
                )}

                {step === 4 && (
                  <StepPhoneNumber
                    phoneNumber={phoneNumber}
                    onPhoneNumberChange={setPhoneNumber}
                    onSubmit={handleStep4Next}
                  />
                )}
              </ScrollView>

              <RegisterFooter
                step={step}
                onBack={goBack}
                onNext={handleNextForStep}
                onSkip={() => setStep((s) => s + 1)}
              />
            </>
          )}

          {step === 5 && (
            <StepSetPin
              pinStep={pinStep}
              firstPin={firstPin}
              confirmPin={confirmPin}
              loading={loading}
              onFirstPinChange={setFirstPin}
              onConfirmPinChange={setConfirmPin}
              onPinEnter={handlePinEnter}
              onPinConfirm={handlePinConfirm}
              onStartOver={() => {
                setPinStep('enter');
                setFirstPin('');
                setConfirmPin('');
              }}
              onBack={goBack}
            />
          )}
        </View>
      </KeyboardAvoidingView>

      <IndustryPickerModal
        visible={showIndustryPicker}
        selected={industry}
        onSelect={(item) => {
          setIndustry(item);
          setShowIndustryPicker(false);
        }}
        onClose={() => setShowIndustryPicker(false)}
      />
    </SafeAreaView>
  );
}
