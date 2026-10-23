import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme.js';

export const TicketTypeCard = ({
  tipo,
  mode = 'select', // 'select' | 'counter'
  quantity = 0,
  onQuantityChange,
  onSelect,
}) => {
  if (!tipo) return null;

  const formattedPrice = `$${Number(tipo.precio).toLocaleString('es-AR')}`;
  const isAvailable = tipo.cupoDisponible > 0;

  return (
    <View style={styles.container}>
      <View style={styles.infoCol}>
        <Text style={styles.name}>{tipo.nombre}</Text>
        <Text style={[styles.stock, !isAvailable && styles.stockSoldOut]}>
          {isAvailable ? `${tipo.cupoDisponible} disponibles` : 'Agotado'}
        </Text>
      </View>

      <View style={styles.actionCol}>
        <Text style={styles.price}>{formattedPrice}</Text>

        {mode === 'counter' ? (
          <View style={styles.counterRow}>
            <TouchableOpacity
              onPress={() => onQuantityChange && onQuantityChange(Math.max(0, quantity - 1))}
              disabled={quantity <= 0}
              style={[styles.counterBtn, quantity <= 0 && styles.counterBtnDisabled]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.counterSymbol, quantity <= 0 && styles.symbolDisabled]}>−</Text>
            </TouchableOpacity>

            <Text style={styles.quantityText}>{quantity}</Text>

            <TouchableOpacity
              onPress={() =>
                onQuantityChange &&
                onQuantityChange(Math.min(tipo.cupoDisponible, quantity + 1))
              }
              disabled={!isAvailable || quantity >= tipo.cupoDisponible}
              style={[
                styles.counterBtn,
                (!isAvailable || quantity >= tipo.cupoDisponible) && styles.counterBtnDisabled,
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text
                style={[
                  styles.counterSymbol,
                  styles.counterSymbolActive,
                  (!isAvailable || quantity >= tipo.cupoDisponible) && styles.symbolDisabled,
                ]}
              >
                +
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={onSelect}
            disabled={!isAvailable}
            style={styles.selectBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.selectText, !isAvailable && styles.selectTextDisabled]}>
              {isAvailable ? 'Seleccionar' : 'Sin cupo'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  infoCol: {
    flex: 1,
    marginRight: SPACING.md,
  },
  name: {
    fontSize: 13,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  stock: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  stockSoldOut: {
    color: COLORS.accentRed,
  },
  actionCol: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  selectBtn: {
    marginTop: 2,
  },
  selectText: {
    fontSize: 11,
    fontWeight: FONTS.semiBold,
    color: COLORS.primary,
  },
  selectTextDisabled: {
    color: COLORS.textSecondary,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  counterBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: {
    opacity: 0.3,
  },
  counterSymbol: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  counterSymbolActive: {
    color: COLORS.primary,
  },
  symbolDisabled: {
    color: COLORS.textSecondary,
  },
  quantityText: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
});
