import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../../constants/theme.js';
import { StatusBadge } from '../common/StatusBadge.js';

export const PurchaseCard = ({ purchase, onPress }) => {
  if (!purchase) return null;

  const getSubtext = () => {
    if (purchase.estado === 'UTILIZADA') {
      return 'Podés calificar el evento';
    }
    if (purchase.estado === 'CANCELADA') {
      return 'Operación finalizada';
    }
    if (purchase.diasRestantes > 0) {
      return `Faltan ${purchase.diasRestantes} días`;
    }
    return 'Hoy es el evento';
  };

  const getSubtextColor = () => {
    if (purchase.estado === 'UTILIZADA') return COLORS.primary;
    if (purchase.estado === 'CANCELADA') return COLORS.textSecondary;
    return COLORS.accentGreen;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <Image
        source={{ uri: purchase.eventoImagen }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {purchase.eventoTitulo}
          </Text>
          <StatusBadge status={purchase.estado} size="sm" />
        </View>

        <Text style={styles.meta} numberOfLines={1}>
          {purchase.cantidad} {purchase.cantidad === 1 ? 'entrada' : 'entradas'} · {purchase.tipoEntradaNombre}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={[styles.subtext, { color: getSubtextColor() }]} numberOfLines={1}>
            {getSubtext()}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} style={styles.chevron} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    ...SHADOWS.subtle,
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginRight: SPACING.xs,
  },
  meta: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtext: {
    fontSize: 11,
    fontWeight: FONTS.semiBold,
  },
  chevron: {
    paddingRight: SPACING.xs,
  },
});
