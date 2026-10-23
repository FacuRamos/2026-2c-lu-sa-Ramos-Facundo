import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../constants/theme.js';
import { StatusBadge } from '../common/StatusBadge.js';

export const SaleItem = ({ name, type, price, status }) => {
  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const formattedPrice = typeof price === 'number'
    ? `$${price.toLocaleString('es-AR')}`
    : price;

  return (
    <View style={styles.container}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{getInitials(name)}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.meta} numberOfLines={1}>{type} · {formattedPrice}</Text>
      </View>

      <StatusBadge status={status} size="sm" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.subtle,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  name: {
    fontSize: 13,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  meta: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
