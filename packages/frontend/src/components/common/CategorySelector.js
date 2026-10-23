import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme.js';

export const CategorySelector = ({
  categories = [],
  selectedCategoryId = 'all',
  onSelectCategory,
  containerStyle,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, containerStyle]}
    >
      {categories.map((cat) => {
        const isSelected = (selectedCategoryId || 'all') === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelectCategory && onSelectCategory(cat.id)}
            activeOpacity={0.7}
            style={[
              styles.pill,
              isSelected ? styles.pillSelected : styles.pillDefault,
            ]}
          >
            <Text
              style={[
                styles.text,
                isSelected ? styles.textSelected : styles.textDefault,
              ]}
            >
              {cat.nombre}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  pill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 3,
    borderRadius: RADIUS.round,
  },
  pillDefault: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  pillSelected: {
    backgroundColor: COLORS.primary,
  },
  text: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
  },
  textDefault: {
    color: COLORS.textSecondary,
  },
  textSelected: {
    color: COLORS.surface,
  },
});
