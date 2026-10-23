import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme.js';

export const StatusBadge = ({ status, size = 'md' }) => {
  const normStatus = (status || '').toLowerCase();
  const config = COLORS.status[normStatus] || {
    bg: COLORS.backgroundSecondary,
    text: COLORS.textSecondary,
    label: status || 'Estado',
  };

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        isSmall && styles.badgeSm,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: config.text },
          isSmall && styles.textSm,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
  },
  text: {
    fontSize: 11,
    fontWeight: FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  textSm: {
    fontSize: 9,
  },
});
