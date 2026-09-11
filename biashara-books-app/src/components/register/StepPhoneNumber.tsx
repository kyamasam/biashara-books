import { Text, TextInput, View } from 'react-native';
import { styles } from './styles';

type Props = {
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  onSubmit: () => void;
};

export function StepPhoneNumber({ phoneNumber, onPhoneNumberChange, onSubmit }: Props) {
  return (
    <>
      <Text style={styles.stepTitle}>Your Phone Number</Text>
      <Text style={styles.stepSubtitle}>This is what you'll use to log in.</Text>

      <View style={styles.field}>
        <Text style={styles.label}>PHONE NUMBER</Text>
        <View style={styles.phoneRow}>
          <Text style={styles.countryCode}>+254</Text>
          <TextInput
            style={styles.phoneInput}
            placeholder="712345678"
            placeholderTextColor="#B8B8B8"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={onPhoneNumberChange}
            autoComplete="tel"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />
        </View>
      </View>
    </>
  );
}
