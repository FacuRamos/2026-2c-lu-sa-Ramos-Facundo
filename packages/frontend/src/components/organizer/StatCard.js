import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../constants/theme.js';

export const StatCard = ({ label, value, subtext, style }) => {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.subtle,
  },
  label: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  value: {
    fontSize: 20,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  subtext: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
