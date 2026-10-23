import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme.js';

export const TicketStockBar = ({ name, sold = 0, total = 0 }) => {
  const safeTotal = Math.max(1, total);
  const percentage = Math.min(100, Math.round((sold / safeTotal) * 100));
  const available = Math.max(0, total - sold);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>
          {sold} vendidas · <Text style={styles.free}>{available} libres</Text>
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  meta: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  free: {
    color: COLORS.accentGreen,
    fontWeight: FONTS.semiBold,
  },
  track: {
    height: 8,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.backgroundSecondary,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.round,
  },
});
