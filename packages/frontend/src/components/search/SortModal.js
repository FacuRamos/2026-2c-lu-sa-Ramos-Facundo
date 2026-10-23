import React, { memo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants/theme.js';

export const SortModal = memo(({
  visible,
  options = [],
  selectedOption,
  onSelectOption,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ordenar eventos por</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Cerrar modal">
              <Ionicons name="close" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.sortItem, isSelected && styles.sortItemSelected]}
                onPress={() => {
                  onSelectOption(opt.id);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.sortItemText,
                    isSelected && styles.sortItemTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  sortItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sortItemSelected: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  sortItemText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
  },
  sortItemTextSelected: {
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
});
