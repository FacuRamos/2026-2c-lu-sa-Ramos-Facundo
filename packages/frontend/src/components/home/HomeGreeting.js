import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS } from '../../constants/theme.js';

export const HomeGreeting = memo(({ userName = 'Invitado' }) => {
  return (
    <View style={styles.greetingSection}>
      <Text style={styles.greetingSubtext}>Buen día, {userName}</Text>
      <Text style={styles.greetingTitle}>
        Encontrá tu próximo{'\n'}
        <Text style={styles.greetingAccent}>momento inolvidable.</Text>
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  greetingSection: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  greetingSubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  greetingTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginTop: SPACING.xs,
    lineHeight: 30,
  },
  greetingAccent: {
    color: COLORS.primary,
  },
});
