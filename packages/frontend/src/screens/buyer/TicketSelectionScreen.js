import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext.js';
import { apiService } from '../../services/apiService.js';
import { COLORS, SPACING, FONTS, RADIUS, SHADOWS } from '../../constants/theme.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { PrimaryButton } from '../../components/common/PrimaryButton.js';
import { TicketTypeCard } from '../../components/events/TicketTypeCard.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const TicketSelectionScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { eventId, selectedTicketId } = route.params || {};
  const { createPurchase } = useApp();

  const [event, setEvent] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        const evt = await apiService.getEventoById(eventId);
        setEvent(evt);

        // Pre-seleccionar 1 entrada del tipo elegido si vino por parámetro
        const initialQuantities = {};
        if (evt.tiposEntrada) {
          evt.tiposEntrada.forEach((t) => {
            if (t.id === selectedTicketId && t.cupoDisponible > 0) {
              initialQuantities[t.id] = 1;
            } else {
              initialQuantities[t.id] = 0;
            }
          });
        }
        setQuantities(initialQuantities);
      } catch (err) {
        Alert.alert('Error', err.message || 'No se pudo cargar el evento');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      loadEvent();
    }
  }, [eventId, selectedTicketId, navigation]);

  const handleQuantityChange = (tipoId, newQty) => {
    setQuantities((prev) => ({
      ...prev,
      [tipoId]: newQty,
    }));
  };

  if (loading || !event) {
    return <LoadingSpinner fullScreen message="Cargando entradas..." />;
  }

  // Cálculos de resumen
  const selectedItems = [];
  let totalAmount = 0;
  let totalTickets = 0;

  if (event.tiposEntrada) {
    event.tiposEntrada.forEach((tipo) => {
      const qty = quantities[tipo.id] || 0;
      if (qty > 0) {
        const itemTotal = tipo.precio * qty;
        totalAmount += itemTotal;
        totalTickets += qty;
        selectedItems.push({
          tipo,
          qty,
          itemTotal,
        });
      }
    });
  }

  const handleConfirmPurchase = async () => {
    if (totalTickets === 0) {
      Alert.alert('Atención', 'Por favor seleccioná al menos una entrada para continuar.');
      return;
    }

    // Permitimos confirmar compra del tipo seleccionado
    const firstSelected = selectedItems[0];
    if (!firstSelected) return;

    try {
      setSubmitting(true);
      const purchase = await createPurchase({
        eventoId: event.id,
        tipoEntradaId: firstSelected.tipo.id,
        cantidad: firstSelected.qty,
      });

      Alert.alert(
        '¡Compra confirmada!',
        `Tu compra para ${event.nombre} fue registrada con éxito. Podés consultarla en "Mis compras".`,
        [
          {
            text: 'Ver detalle de compra',
            onPress: () =>
              navigation.replace('PurchaseDetail', {
                purchaseId: purchase.id,
              }),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error al comprar', err.message || 'Ocurrió un error inesperado al procesar la compra.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Comprar entradas"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Resumen del Evento */}
        <View style={styles.eventMiniCard}>
          <Image source={{ uri: event.imagen }} style={styles.eventThumb} resizeMode="cover" />
          <View style={styles.eventMiniInfo}>
            <Text style={styles.eventMiniTitle} numberOfLines={1}>
              {event.nombre}
            </Text>
            <Text style={styles.eventMiniDate}>{event.fechaTexto}</Text>
            <Text style={styles.eventMiniPlace} numberOfLines={1}>
              {event.ubicacion}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Elegí tus entradas</Text>

        {/* Listado con selector de cantidad */}
        {event.tiposEntrada &&
          event.tiposEntrada.map((tipo) => (
            <TicketTypeCard
              key={tipo.id}
              tipo={tipo}
              mode="counter"
              quantity={quantities[tipo.id] || 0}
              onQuantityChange={(qty) => handleQuantityChange(tipo.id, qty)}
            />
          ))}

        {/* Resumen de costos */}
        <View style={styles.summaryCard}>
          {selectedItems.length > 0 ? (
            selectedItems.map((item) => (
              <View key={item.tipo.id} style={styles.summaryRow}>
                <Text style={styles.summaryItemText}>
                  {item.tipo.nombre} × {item.qty}
                </Text>
                <Text style={styles.summaryItemPrice}>
                  ${item.itemTotal.toLocaleString('es-AR')}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noSelectedText}>No has seleccionado entradas aún</Text>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalAmount.toLocaleString('es-AR')}</Text>
          </View>
        </View>

        {/* Mensaje de garantía */}
        <View style={styles.guaranteeBox}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.accentGreen} style={styles.shieldIcon} />
          <Text style={styles.guaranteeText}>
            Compra protegida. Podés confirmar tu pedido y gestionar cancelaciones según las políticas del evento.
          </Text>
        </View>

        {/* Botón de Confirmación */}
        <PrimaryButton
          title={totalTickets > 0 ? `Confirmar compra (${totalTickets})` : 'Confirmar compra'}
          onPress={handleConfirmPurchase}
          loading={submitting}
          disabled={totalTickets === 0 || submitting}
          style={styles.confirmButton}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  eventMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    marginBottom: SPACING.lg,
    ...SHADOWS.subtle,
  },
  eventThumb: {
    width: 64,
    height: 56,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.backgroundSecondary,
  },
  eventMiniInfo: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  eventMiniTitle: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  eventMiniDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  eventMiniPlace: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  summaryCard: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(70, 113, 122, 0.2)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  summaryItemText: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  summaryItemPrice: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  noSelectedText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(70, 113, 122, 0.15)',
    marginVertical: SPACING.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  shieldIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  guaranteeText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSecondary,
  },
  confirmButton: {
    marginBottom: SPACING.lg,
  },
});
