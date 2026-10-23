import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme.js';

export const SearchBar = ({
  value,
  onChangeText,
  onClear,
  onPress,
  editable = true,
  placeholder = 'Buscá artistas, eventos o lugares...',
  autoFocus = false,
  containerStyle,
}) => {
  const content = (
    <View style={[styles.container, containerStyle]}>
      <Ionicons name="search" size={18} color={COLORS.primary} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        editable={editable}
        autoFocus={autoFocus}
        pointerEvents={editable ? 'auto' : 'none'}
      />
      {value && onClear ? (
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );

  if (!editable && onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    padding: 0,
    fontWeight: FONTS.medium,
  },
});
