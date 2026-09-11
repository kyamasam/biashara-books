import { PinPad } from '@/components/pin-pad';
import { AppButton } from '@/components/ui/button';
import { BrandColors } from '@/constants/theme';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { styles } from './styles';
import { PinStep } from './types';

type Props = {
  pinStep: PinStep;
  firstPin: string;
  confirmPin: string;
  loading: boolean;
  onFirstPinChange: (pin: string) => void;
  onConfirmPinChange: (pin: string) => void;
  onPinEnter: (pin: string) => void;
  onPinConfirm: (pin: string) => void;
  onStartOver: () => void;
  onBack: () => void;
};

export function StepSetPin({
  pinStep,
  firstPin,
  confirmPin,
  loading,
  onFirstPinChange,
  onConfirmPinChange,
  onPinEnter,
  onPinConfirm,
  onStartOver,
  onBack,
}: Props) {
  return (
    <View style={[styles.content, styles.pinContent]}>
      <Text style={styles.stepTitle}>{pinStep === 'enter' ? 'Create a PIN' : 'Confirm your PIN'}</Text>
      <Text style={styles.stepSubtitle}>
        {pinStep === 'enter'
          ? 'Choose a 4-digit PIN to quickly access your account'
          : 'Enter your PIN again to confirm'}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={BrandColors.primary} style={styles.spinner} />
      ) : pinStep === 'enter' ? (
        <PinPad variant='login' value={firstPin} onChange={onFirstPinChange} onComplete={onPinEnter} />
      ) : (
        <PinPad variant='login' value={confirmPin} onChange={onConfirmPinChange} onComplete={onPinConfirm} />
      )}

      {!loading && pinStep === 'confirm' && (
        <Pressable style={styles.startOver} onPress={onStartOver}>
          <Text style={styles.startOverText}>Start over</Text>
        </Pressable>
      )}

      {!loading && (
        <AppButton label="BACK" variant="secondary" size="lg" style={styles.backBtn} onPress={onBack} />
      )}
    </View>
  );
}
