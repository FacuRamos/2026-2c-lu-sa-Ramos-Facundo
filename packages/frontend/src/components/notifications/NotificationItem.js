import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme.js';

export const NotificationItem = ({ notificacion, onPress }) => {
  const { id, tipo, titulo, mensaje, leida, fechaCreacion } = notificacion;

  const getIconInfo = () => {
    switch (tipo) {
      case 'COMPRA_CONFIRMADA':
      case 'NUEVA_VENTA':
        return { name: 'ticket-outline', color: COLORS.accentGreen, bg: '#EAF3EC' };
      case 'NUEVO_MENSAJE_CHAT':
        return { name: 'chatbubble-ellipses-outline', color: COLORS.primary, bg: COLORS.primaryLight };
      case 'CUPO_CRITICO':
        return { name: 'alert-circle-outline', color: COLORS.accentAmber, bg: '#F6EEDB' };
      case 'COMPRA_CANCELADA':
        return { name: 'close-circle-outline', color: COLORS.accentRed, bg: '#F8EAE8' };
      case 'RECORDATORIO_CALIFICAR':
        return { name: 'star-outline', color: COLORS.star, bg: '#FAF2DF' };
      default:
        return { name: 'notifications-outline', color: COLORS.primary, bg: COLORS.primaryLight };
    }
  };

  const formatTiempo = (fechaIso) => {
    try {
      const fecha = new Date(fechaIso);
      const diffMs = Date.now() - fecha.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Ahora';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      const diffHs = Math.floor(diffMins / 60);
      if (diffHs < 24) return `Hace ${diffHs} h`;
      const diffDias = Math.floor(diffHs / 24);
      return `Hace ${diffDias} d`;
    } catch {
      return '';
    }
  };

  const icon = getIconInfo();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, !leida && styles.unreadContainer]}
      onPress={() => onPress && onPress(id)}
    >
      <View style={[styles.iconWrapper, { backgroundColor: icon.bg }]}>
        <Ionicons name={icon.name} size={20} color={icon.color} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, !leida && styles.unreadTitle]} numberOfLines={1}>
            {titulo}
          </Text>
          <Text style={styles.timeText}>{formatTiempo(fechaCreacion)}</Text>
        </View>

        <Text style={styles.message} numberOfLines={2}>
          {mensaje}
        </Text>
      </View>

      {!leida ? <View style={styles.unreadDot} /> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    position: 'relative',
  },
  unreadContainer: {
    backgroundColor: '#F8FBFA',
    borderColor: COLORS.primaryLight,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.xs,
  },
  unreadTitle: {
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
});
