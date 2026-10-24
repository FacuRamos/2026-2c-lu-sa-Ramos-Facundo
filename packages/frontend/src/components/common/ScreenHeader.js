import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants/theme.js';
import { NotificationBell } from '../notifications/NotificationBell.js';

export const ScreenHeader = ({
  title,
  showBack = false,
  onBack,
  rightAction,
  showLogo = false,
  subtitle,
  showNotificationBell = false,
}) => {
  const resolvedRightAction =
    rightAction !== undefined
      ? rightAction
      : showNotificationBell || (!showBack && showLogo)
      ? <NotificationBell />
      : null;

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Volver"
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color={COLORS.textPrimary} />
          </TouchableOpacity>
        ) : showLogo ? (
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="ticket" size={16} color={COLORS.surface} />
            </View>
            <Text style={styles.logoText}>
              AI Ticket <Text style={styles.logoItalic}>It</Text>
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.centerContainer}>
        {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>

      <View style={styles.rightContainer}>
        {resolvedRightAction}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  leftContainer: {
    minWidth: 40,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  rightContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 15,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  logoItalic: {
    fontStyle: 'italic',
    color: COLORS.primary,
  },
  title: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
