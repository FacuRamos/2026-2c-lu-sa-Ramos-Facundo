import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../constants/theme.js';

export const PrimaryButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.surface} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <Text style={[styles.text, disabled && styles.textDisabled, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.subtle,
  },
  buttonDisabled: {
    backgroundColor: COLORS.backgroundSecondary,
    elevation: 0,
    shadowOpacity: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  text: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    letterSpacing: 0.1,
  },
  textDisabled: {
    color: COLORS.textSecondary,
  },
});
