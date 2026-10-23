import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../constants/theme.js';

export const EventCard = ({
  event,
  compact = false,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  style,
}) => {
  if (!event) return null;

  const formattedPrice = event.precioMinimo
    ? `$${Number(event.precioMinimo).toLocaleString('es-AR')}`
    : '$0';

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.compactContainer, style]}
      >
        <Image
          source={{ uri: event.imagen }}
          style={styles.compactImage}
          resizeMode="cover"
        />
        <View style={styles.compactContent}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={11} color={COLORS.primary} style={styles.metaIcon} />
            <Text style={styles.compactDate} numberOfLines={1}>
              {event.fechaTexto}
            </Text>
          </View>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {event.nombre}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={11} color={COLORS.textSecondary} style={styles.metaIcon} />
            <Text style={styles.compactLocation} numberOfLines={1}>
              {event.ubicacion}
            </Text>
          </View>
          <Text style={styles.compactPrice}>Desde {formattedPrice}</Text>
        </View>

        {onToggleFavorite ? (
          <TouchableOpacity
            style={styles.compactFavButton}
            onPress={onToggleFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? COLORS.accentRed : COLORS.textSecondary}
            />
          </TouchableOpacity>
        ) : (
          <Ionicons name="chevron-forward" size={16} color={COLORS.border} style={styles.chevron} />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.cardContainer, style]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.imagen }}
          style={styles.image}
          resizeMode="cover"
        />
        {onToggleFavorite ? (
          <TouchableOpacity
            style={styles.heartCircle}
            onPress={onToggleFavorite}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={16}
              color={isFavorite ? COLORS.accentRed : COLORS.textPrimary}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={11} color={COLORS.primary} style={styles.metaIcon} />
          <Text style={styles.dateText}>{event.fechaTexto}</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {event.nombre}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={11} color={COLORS.textSecondary} style={styles.metaIcon} />
          <Text style={styles.locationText} numberOfLines={1}>
            {event.ubicacion}
          </Text>
        </View>
        <Text style={styles.priceText}>Desde {formattedPrice}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Vertical card
  cardContainer: {
    width: 210,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.subtle,
  },
  imageContainer: {
    height: 120,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.backgroundSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartCircle: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 30,
    height: 30,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaIcon: {
    marginRight: 4,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: FONTS.semiBold,
  },
  title: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
  priceText: {
    fontSize: 12,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },

  // Compact horizontal card
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    ...SHADOWS.subtle,
  },
  compactImage: {
    width: 76,
    height: 76,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
  compactContent: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  compactDate: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: FONTS.semiBold,
  },
  compactTitle: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginVertical: 2,
  },
  compactLocation: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  compactPrice: {
    fontSize: 11,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  compactFavButton: {
    padding: SPACING.sm,
  },
  chevron: {
    paddingRight: SPACING.xs,
  },
});
