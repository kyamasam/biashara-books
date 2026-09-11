import { Pressable, Text, TextInput, View } from 'react-native';
import { styles } from './styles';

type Props = {
  businessName: string;
  onBusinessNameChange: (value: string) => void;
  industry: string;
  onOpenIndustryPicker: () => void;
};

export function StepBusinessDetails({ businessName, onBusinessNameChange, industry, onOpenIndustryPicker }: Props) {
  return (
    <>
      <Text style={styles.stepTitle}>Your Business</Text>
      <Text style={styles.stepSubtitle}>Tell us a bit about your business to get started.</Text>

      <View style={styles.field}>
        <Text style={styles.label}>BUSINESS NAME</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Roadside Hardware"
          placeholderTextColor="#B8B8B8"
          value={businessName}
          onChangeText={onBusinessNameChange}
          returnKeyType="next"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>INDUSTRY</Text>
        <Pressable style={styles.pickerTrigger} onPress={onOpenIndustryPicker}>
          <Text style={[styles.pickerTriggerText, !industry && styles.pickerPlaceholder]}>
            {industry || 'Select industry'}
          </Text>
          <Text style={styles.pickerChevron}>›</Text>
        </Pressable>
      </View>
    </>
  );
}
