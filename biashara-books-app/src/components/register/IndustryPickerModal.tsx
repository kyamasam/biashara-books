import { get } from '@/lib/api';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, Text, View } from 'react-native';
import { styles } from './styles';

interface Industry {
  id: string;
  name: string;
}

interface ApiResponse {
  success: boolean;
  data: Industry[];
}

type Props = {
  visible: boolean;
  selectedId: string;
  onSelect: (industry: Industry) => void;
  onClose: () => void;
};

export function IndustryPickerModal({ visible, selectedId, onSelect, onClose }: Props) {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || industries.length > 0) return;
    setLoading(true);
    get<ApiResponse>('/api/public/industries')
      .then((res) => setIndustries(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalTitle}>Select Industry</Text>
        {loading ? (
          <ActivityIndicator style={styles.spinner} />
        ) : (
          <FlatList
            data={industries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.modalItem, selectedId === item.id && styles.modalItemSelected]}
                onPress={() => onSelect(item)}
              >
                <Text style={[styles.modalItemText, selectedId === item.id && styles.modalItemTextSelected]}>
                  {item.name}
                </Text>
                {selectedId === item.id && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
            )}
          />
        )}
      </View>
    </Modal>
  );
}
