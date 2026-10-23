import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme.js';
import { SecondaryButton } from './SecondaryButton.js';

export const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="alert-circle-outline" size={20} color={COLORS.accentRed} style={styles.icon} />
        <Text style={styles.message}>{message}</Text>
      </View>
      {onRetry ? (
        <SecondaryButton
          title="Reintentar"
          onPress={onRetry}
          variant="filled"
          style={styles.retryButton}
          textStyle={styles.retryText}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FBEBEB',
    borderColor: '#F0DEDA',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: SPACING.sm,
  },
  message: {
    flex: 1,
    fontSize: 12,
    color: COLORS.accentRed,
    fontWeight: FONTS.medium,
  },
  retryButton: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
  },
  retryText: {
    fontSize: 11,
  },
});
