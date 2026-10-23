import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme.js';

export const ChatMessage = ({ message, isOwnMessage = false }) => {
  if (!message) return null;

  return (
    <View
      style={[
        styles.row,
        isOwnMessage ? styles.rowEnd : styles.rowStart,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        <Text style={[styles.text, isOwnMessage ? styles.ownText : styles.otherText]}>
          {message.texto}
        </Text>
        {message.fecha ? (
          <Text
            style={[
              styles.time,
              isOwnMessage ? styles.ownTime : styles.otherTime,
            ]}
          >
            {message.fecha}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginVertical: SPACING.xs + 2,
    flexDirection: 'row',
  },
  rowStart: {
    justifyContent: 'flex-start',
  },
  rowEnd: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
  },
  otherBubble: {
    backgroundColor: COLORS.backgroundSecondary,
    borderTopLeftRadius: RADIUS.xs,
  },
  ownBubble: {
    backgroundColor: COLORS.primary,
    borderTopRightRadius: RADIUS.xs,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
  },
  otherText: {
    color: COLORS.textPrimary,
  },
  ownText: {
    color: COLORS.surface,
  },
  time: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  otherTime: {
    color: COLORS.textSecondary,
  },
  ownTime: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
});
