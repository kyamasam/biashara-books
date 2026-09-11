import { View } from 'react-native';
import { styles } from './styles';

const TOTAL_STEPS = 5;

export function ProgressBar({ step }: { step: number }) {
  return (
    <View style={styles.progressTrack}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
        <View key={s} style={[styles.progressSegment, s <= step && styles.progressSegmentActive]} />
      ))}
    </View>
  );
}
