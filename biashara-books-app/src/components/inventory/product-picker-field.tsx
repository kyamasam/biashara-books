import { Package, Search, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BrandColors, Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { authGet } from '@/lib/api';
import type { ApiProduct } from '@/types/product';

type Props = {
  selectedProductId: string;
  onSelect: (id: string) => void;
};

export function ProductPickerField({ selectedProductId, onSelect }: Props) {
  const { accessToken } = useAuth();

  const [query, setQuery] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [results, setResults] = useState<ApiProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim() || !accessToken) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await authGet<{ data: ApiProduct[] }>(
          `/api/products/search?name=${encodeURIComponent(query.trim())}`,
          accessToken,
        );
        setResults(response.data ?? []);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, accessToken]);

  function handleSelect(product: ApiProduct) {
    setSelectedName(product.name);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    onSelect(product.id);
  }

  function handleClear() {
    setSelectedName('');
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    onSelect('');
  }

  const isSelected = Boolean(selectedProductId && selectedName);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Product</Text>

      <View style={styles.inputContainer}>
        {isSelected ? (
          <View style={styles.selectedRow}>
            <Text style={styles.selectedName} numberOfLines={1}>
              {selectedName}
            </Text>
            <Pressable
              onPress={handleClear}
              hitSlop={8}
              accessibilityLabel="Clear product selection"
              accessibilityRole="button">
              <X size={16} color={Colors.light.textSecondary} strokeWidth={2.2} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.inputWrapper}>
            <Search size={16} color={Colors.light.textSecondary} strokeWidth={2} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search products…"
              placeholderTextColor={Colors.light.textSecondary}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {isSearching ? (
              <ActivityIndicator size="small" color={BrandColors.primary} />
            ) : null}
          </View>
        )}

        {showDropdown && results.length > 0 ? (
          <View style={styles.dropdown}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.dropdownScroll}
              contentContainerStyle={styles.dropdownContent}>
              {results.map((product, index) => (
                <Pressable
                  key={product.id}
                  onPress={() => handleSelect(product)}
                  onPressIn={() => setPressedIndex(index)}
                  onPressOut={() => setPressedIndex(null)}
                  style={[
                    styles.dropdownItem,
                    index < results.length - 1 && styles.dropdownItemBorder,
                    pressedIndex === index && styles.pressed,
                  ]}
                  accessibilityRole="button">
                  {product.photoUrl ? (
                    <Image
                      source={{ uri: product.photoUrl }}
                      style={styles.productImage}
                    />
                  ) : (
                    <View style={styles.productImagePlaceholder}>
                      <Package size={18} color={Colors.light.textSecondary} strokeWidth={1.5} />
                    </View>
                  )}
                  <View style={styles.productInfo}>
                    <Text style={styles.dropdownItemText} numberOfLines={1}>
                      {product.name}
                    </Text>
                    {product.description ? (
                      <Text style={styles.dropdownItemSub} numberOfLines={1}>
                        {product.description}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : showDropdown && !isSearching && query.trim() ? (
          <View style={styles.dropdown}>
            <View style={styles.dropdownItem}>
              <Text style={styles.emptyText}>No products found for "{query}"</Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  label: {
    color: Colors.light.text,
    fontSize: 13,
    fontWeight: '800',
  },
  inputContainer: {
    position: 'relative',
    zIndex: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#D8DDE0',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 50,
    borderWidth: 1,
    borderColor: BrandColors.primary,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    backgroundColor: '#E8F7EE',
  },
  selectedName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  dropdown: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    zIndex: 100,
    borderWidth: 1,
    borderColor: '#D8DDE0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  dropdownScroll: {
    maxHeight: 240,
    borderRadius: 8,
  },
  dropdownContent: {
    flexGrow: 1,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    gap: Spacing.two,
  },
  dropdownItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#F0F0F3',
    flexShrink: 0,
  },
  productImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#F0F0F3',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  dropdownItemSub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '400',
  },
  pressed: {
    backgroundColor: '#F5F5F5',
  },
});