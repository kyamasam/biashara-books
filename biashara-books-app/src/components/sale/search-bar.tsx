import { Scan, Search } from 'lucide-react-native';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onScanPress?: () => void;
};

export function SearchBar({ value, onChangeText, onScanPress }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Search size={18} color="#9CA3AF" strokeWidth={2} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Search Products"
        placeholderTextColor="#9CA3AF"
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      <TouchableOpacity onPress={onScanPress} activeOpacity={0.7} style={styles.scanButton}>
        <Scan size={22} color="#6B7280" strokeWidth={1.8} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111111',
    padding: 0,
    margin: 0,
  },
  scanButton: {
    padding: 2,
  },
});
