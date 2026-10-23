import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme.js';

export const SecondaryButton = ({
  title,
  onPress,
  disabled = false,
  variant = 'outline', // 'outline' | 'filled' | 'danger' | 'ghost'
  icon,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'filled':
        return styles.filledButton;
      case 'danger':
        return styles.dangerButton;
      case 'ghost':
        return styles.ghostButton;
      case 'outline':
      default:
        return styles.outlineButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'filled':
        return styles.filledText;
      case 'danger':
        return styles.dangerText;
      case 'ghost':
        return styles.ghostText;
      case 'outline':
      default:
        return styles.outlineText;
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.baseButton,
        getButtonStyle(),
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
        <Text style={[styles.baseText, getTextStyle(), disabled && styles.textDisabled, textStyle]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filledButton: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  dangerButton: {
    backgroundColor: 'transparent',
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: SPACING.sm,
  },
  baseText: {
    fontSize: 13,
    fontWeight: FONTS.semiBold,
  },
  outlineText: {
    color: COLORS.textPrimary,
  },
  filledText: {
    color: COLORS.textPrimary,
  },
  dangerText: {
    color: COLORS.accentRed,
  },
  ghostText: {
    color: COLORS.primary,
  },
  textDisabled: {
    color: COLORS.textSecondary,
  },
});
