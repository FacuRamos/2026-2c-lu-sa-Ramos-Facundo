import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants/theme.js';

export const PurchaseTabs = memo(({ tabs = [], activeTab, onSelectTab }) => {
  return (
    <View style={styles.tabsRow}>
      {tabs.map((tab) => {
        const isSelected = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onSelectTab(tab)}
            activeOpacity={0.7}
            style={[styles.tabPill, isSelected ? styles.tabSelected : styles.tabDefault]}
          >
            <Text
              style={[
                styles.tabText,
                isSelected ? styles.tabTextSelected : styles.tabTextDefault,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  tabPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.round,
  },
  tabDefault: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  tabSelected: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.semiBold,
  },
  tabTextDefault: {
    color: COLORS.textSecondary,
  },
  tabTextSelected: {
    color: COLORS.surface,
  },
});
