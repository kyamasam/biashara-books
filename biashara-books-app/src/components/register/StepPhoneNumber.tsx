import { Text, TextInput, View } from 'react-native';
import { styles } from './styles';

type Props = {
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
};

export function StepPhoneNumber({ phoneNumber, onPhoneNumberChange, email, onEmailChange, onSubmit }: Props) {
  return (
    <>
      <Text style={styles.stepTitle}>Your Details</Text>
      <Text style={styles.stepSubtitle}>Enter your phone number to log in. Email is optional.</Text>

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
            returnKeyType="next"
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>EMAIL (OPTIONAL)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="you@example.com"
          placeholderTextColor="#B8B8B8"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={onEmailChange}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
      </View>
    </>
  );
}
