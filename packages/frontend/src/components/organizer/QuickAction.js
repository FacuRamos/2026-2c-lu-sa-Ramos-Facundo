import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../constants/theme.js';

export const QuickAction = ({ icon, text, onPress, badgeCount }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Ionicons name={icon} size={22} color={COLORS.primary} />
      <Text style={styles.text}>{text}</Text>
      {badgeCount ? (
        <Text style={styles.badge}>{badgeCount}</Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    position: 'relative',
    ...SHADOWS.subtle,
  },
  text: {
    fontSize: 11,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginTop: 6,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 8,
    backgroundColor: COLORS.accentRed,
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: FONTS.bold,
    borderRadius: RADIUS.round,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
});
