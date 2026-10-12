import { Pencil, Trash2, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors, Colors, Spacing } from '@/constants/theme';
import { useToast } from '@/context/toast-context';
import { useProductStore } from '@/store/product-store';
import type { ProductCategory } from '@/types/product';

type EditModal = { category: ProductCategory };

interface Props {
  /** Controls the "browse / manage" categories sheet. */
  manageVisible: boolean;
  onManageClose: () => void;
  /** Controls the "add category" sheet directly (e.g. quick-add from the filter bar). */
  addVisible: boolean;
  onAddClose: () => void;
  selectedCategoryId: string | null;
  onCategoryDeleted: (deletedId: string) => void;
}

export function CategoryManagement({
  manageVisible,
  onManageClose,
  addVisible,
  onAddClose,
  selectedCategoryId,
  onCategoryDeleted,
}: Props) {
  const safeAreaInsets = useSafeAreaInsets();
  const { showError, showSuccess } = useToast();
  const { categories, isManagingCategory, createCategory, updateCategory, deleteCategory } =
    useProductStore();

  const [editModal, setEditModal] = useState<EditModal | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const nameInputRef = useRef<TextInput>(null);

  // Focus input whenever the add or edit sheet opens
  const addSheetOpen = addVisible;
  const editSheetOpen = editModal !== null;
  useEffect(() => {
    if (addSheetOpen || editSheetOpen) {
      const t = setTimeout(() => nameInputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [addSheetOpen, editSheetOpen]);

  // Pre-fill name when entering edit mode
  useEffect(() => {
    if (editModal) setCategoryName(editModal.category.name);
  }, [editModal]);

  function openEditModal(cat: ProductCategory) {
    onManageClose();
    setTimeout(() => setEditModal({ category: cat }), 250);
  }

  function closeAddSheet() {
    setCategoryName('');
    onAddClose();
  }

  function closeEditSheet() {
    setCategoryName('');
    setEditModal(null);
  }

  async function handleSaveAdd() {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    try {
      await createCategory(trimmed);
      showSuccess(`"${trimmed}" added.`);
      closeAddSheet();
    } catch {
      showError('Could not save category.');
    }
  }

  async function handleSaveEdit() {
    const trimmed = categoryName.trim();
    if (!trimmed || !editModal) return;
    try {
      await updateCategory(editModal.category.id, trimmed);
      showSuccess(`"${trimmed}" updated.`);
      closeEditSheet();
    } catch {
      showError('Could not save category.');
    }
  }

  function handleDeleteCategory(cat: ProductCategory) {
    Alert.alert(
      'Delete Category',
      `Remove "${cat.name}"? Products in this category will be uncategorised.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(cat.id);
              if (selectedCategoryId === cat.id) onCategoryDeleted(cat.id);
              showSuccess(`"${cat.name}" deleted.`);
            } catch {
              showError('Could not delete category.');
            }
          },
        },
      ],
    );
  }

  return (
    <>
      {/* Browse / manage sheet */}
      <Modal visible={manageVisible} transparent animationType="slide" onRequestClose={onManageClose}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onManageClose} />
          <View style={[styles.sheet, styles.manageSheet, { paddingBottom: safeAreaInsets.bottom + Spacing.three }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Categories</Text>
              <Pressable
                onPress={onManageClose}
                style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}>
                <X size={18} color={Colors.light.textSecondary} strokeWidth={2.2} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.categoryList}>
              {categories.length === 0 ? (
                <Text style={styles.emptyText}>No categories yet. Tap "+" to add one.</Text>
              ) : (
                categories.map((cat, idx) => (
                  <View
                    key={cat.id}
                    style={[styles.categoryRow, idx < categories.length - 1 && styles.categoryRowBorder]}>
                    <Text style={styles.categoryRowName} numberOfLines={1}>{cat.name}</Text>
                    <View style={styles.rowActions}>
                      <Pressable
                        accessibilityLabel={`Edit ${cat.name}`}
                        onPress={() => openEditModal(cat)}
                        style={({ pressed }) => [styles.rowActionBtn, pressed && styles.pressed]}>
                        <Pencil size={16} color={BrandColors.primary} strokeWidth={2.2} />
                      </Pressable>
                      <Pressable
                        accessibilityLabel={`Delete ${cat.name}`}
                        onPress={() => handleDeleteCategory(cat)}
                        style={({ pressed }) => [styles.rowActionBtn, pressed && styles.pressed]}>
                        <Trash2 size={16} color="#d72450" strokeWidth={2.2} />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add category sheet */}
      <Modal visible={addVisible} transparent animationType="slide" onRequestClose={closeAddSheet}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeAddSheet} />
          <View style={[styles.sheet, { paddingBottom: safeAreaInsets.bottom + Spacing.three }]}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>New Category</Text>
            <TextInput
              ref={nameInputRef}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Category name"
              placeholderTextColor={Colors.light.textSecondary}
              style={styles.sheetInput}
              returnKeyType="done"
              onSubmitEditing={handleSaveAdd}
              autoCapitalize="words"
            />
            <Pressable
              onPress={handleSaveAdd}
              disabled={isManagingCategory || !categoryName.trim()}
              style={[styles.saveBtn, (!categoryName.trim() || isManagingCategory) && styles.saveBtnDisabled]}>
              {isManagingCategory ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveBtnText}>Add Category</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit / rename category sheet */}
      <Modal visible={editSheetOpen} transparent animationType="slide" onRequestClose={closeEditSheet}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeEditSheet} />
          <View style={[styles.sheet, { paddingBottom: safeAreaInsets.bottom + Spacing.three }]}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Rename Category</Text>
            <TextInput
              ref={nameInputRef}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Category name"
              placeholderTextColor={Colors.light.textSecondary}
              style={styles.sheetInput}
              returnKeyType="done"
              onSubmitEditing={handleSaveEdit}
              autoCapitalize="words"
            />
            <Pressable
              onPress={handleSaveEdit}
              disabled={isManagingCategory || !categoryName.trim()}
              style={[styles.saveBtn, (!categoryName.trim() || isManagingCategory) && styles.saveBtnDisabled]}>
              {isManagingCategory ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: Spacing.one,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
  },
  sheetInput: {
    borderWidth: 1,
    borderColor: '#D8DDE0',
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.light.text,
    backgroundColor: '#FAFAFA',
  },
  saveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: BrandColors.primary,
    minHeight: 48,
  },
  saveBtnDisabled: { backgroundColor: '#D1D5DB' },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  manageSheet: { maxHeight: '75%' },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryList: { flexGrow: 0 },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: Spacing.two,
  },
  categoryRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  categoryRowName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.text,
  },
  rowActions: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  rowActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F3',
  },
  pressed: { opacity: 0.6 },
});
