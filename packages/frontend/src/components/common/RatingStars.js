import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme.js';

export const RatingStars = ({
  rating = 5,
  maxStars = 5,
  size = 16,
  interactive = false,
  onRatingChange,
}) => {
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    const isFilled = i <= Math.round(rating);
    const starComponent = (
      <Ionicons
        key={i}
        name={isFilled ? 'star' : 'star-outline'}
        size={size}
        color={COLORS.star}
        style={styles.star}
      />
    );

    if (interactive) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => onRatingChange && onRatingChange(i)}
          activeOpacity={0.7}
        >
          {starComponent}
        </TouchableOpacity>
      );
    } else {
      stars.push(starComponent);
    }
  }

  return <View style={styles.container}>{stars}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
});
