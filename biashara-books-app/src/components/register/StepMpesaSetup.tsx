import { Pressable, Text, TextInput, View } from 'react-native';
import { MpesaType } from './types';
import { styles } from './styles';

const MPESA_TYPE_LABEL: Record<MpesaType, string> = {
  paybill: 'Paybill',
  till: 'Till Number',
  pochi: 'Pochi la Biashara',
};

const MPESA_TYPE_DESC: Record<MpesaType, string> = {
  paybill: 'Customers pay using a business number',
  till: 'Customers pay using a till / buy goods number',
  pochi: 'Customers pay directly to your phone number',
};

type Props = {
  mpesaType: MpesaType | null;
  mpesaNumber: string;
  onMpesaTypeChange: (type: MpesaType) => void;
  onMpesaNumberChange: (value: string) => void;
};

export function StepMpesaSetup({ mpesaType, mpesaNumber, onMpesaTypeChange, onMpesaNumberChange }: Props) {
  return (
    <>
      <Text style={styles.stepTitle}>M-PESA Setup</Text>
      <Text style={styles.stepSubtitle}>How do customers pay you via M-PESA?</Text>

      <View style={styles.mpesaCards}>
        {(['paybill', 'till', 'pochi'] as MpesaType[]).map((type) => (
          <Pressable
            key={type}
            style={[styles.mpesaCard, mpesaType === type && styles.mpesaCardSelected]}
            onPress={() => onMpesaTypeChange(type)}
          >
            <Text style={[styles.mpesaCardTitle, mpesaType === type && styles.mpesaCardTitleSelected]}>
              {MPESA_TYPE_LABEL[type]}
            </Text>
            <Text style={styles.mpesaCardDesc}>{MPESA_TYPE_DESC[type]}</Text>
          </Pressable>
        ))}
      </View>

      {(mpesaType === 'paybill' || mpesaType === 'till') && (
        <View style={styles.field}>
          <Text style={styles.label}>{mpesaType === 'paybill' ? 'BUSINESS NUMBER' : 'TILL NUMBER'}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={mpesaType === 'paybill' ? 'e.g. 174379' : 'e.g. 5678901'}
            placeholderTextColor="#B8B8B8"
            keyboardType="numeric"
            value={mpesaNumber}
            onChangeText={onMpesaNumberChange}
          />
        </View>
      )}
    </>
  );
}
