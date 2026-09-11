import { AppButton } from '@/components/ui/button';
import { Pressable, Text, View } from 'react-native';
import { styles } from './styles';

type Props = {
  step: number;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
};

export function RegisterFooter({ step, onBack, onNext, onSkip }: Props) {
  return (
    <View style={styles.footer}>
      {(step === 2 || step === 3) && (
        <Pressable style={styles.skipLink} onPress={onSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      )}
      <View style={styles.footerRow}>
        <AppButton label="BACK" variant="secondary" size="lg" style={styles.backBtn} onPress={onBack} />
        <AppButton label="NEXT" variant="primary" size="lg" style={styles.nextBtn} onPress={onNext} />
      </View>
    </View>
  );
}
