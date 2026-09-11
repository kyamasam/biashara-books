import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { styles } from './styles';

const INDUSTRIES = [
  'Retail / General Shop',
  'Food & Beverage',
  'Hardware & Construction',
  'Salon & Beauty',
  'Pharmacy & Health',
  'Agriculture',
  'Transport & Logistics',
  'Other',
];

type Props = {
  visible: boolean;
  selected: string;
  onSelect: (industry: string) => void;
  onClose: () => void;
};

export function IndustryPickerModal({ visible, selected, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalTitle}>Select Industry</Text>
        <FlatList
          data={INDUSTRIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.modalItem, selected === item && styles.modalItemSelected]}
              onPress={() => onSelect(item)}
            >
              <Text style={[styles.modalItemText, selected === item && styles.modalItemTextSelected]}>{item}</Text>
              {selected === item && <Text style={styles.checkmark}>✓</Text>}
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}
