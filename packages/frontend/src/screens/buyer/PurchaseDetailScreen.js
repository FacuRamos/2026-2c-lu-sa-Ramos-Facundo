import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext.js';
import { apiService } from '../../services/apiService.js';
import { COLORS, SPACING, FONTS, RADIUS, SHADOWS } from '../../constants/theme.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { PrimaryButton } from '../../components/common/PrimaryButton.js';
import { SecondaryButton } from '../../components/common/SecondaryButton.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const PurchaseDetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { purchaseId } = route.params || {};
  const { cancelPurchase, purchases } = useApp();

  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function loadPurchase() {
      try {
        setLoading(true);
        const p = await apiService.getCompraById(purchaseId);
        setPurchase(p);
      } catch (err) {
        Alert.alert('Error', err.message || 'No se pudo cargar la compra');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }

    if (purchaseId) {
      loadPurchase();
    }
  }, [purchaseId, purchases, navigation]);

  if (loading || !purchase) {
    return <LoadingSpinner fullScreen message="Cargando compra..." />;
  }

  const isConfirmed = purchase.estado === 'CONFIRMADA';
  const isUtilizada = purchase.estado === 'UTILIZADA';
  const isCancelada = purchase.estado === 'CANCELADA';

  const cantidad = Number(purchase.cantidad || 1);
  const rawPrecioTotal = Number(purchase.precioTotal ?? purchase.total ?? 0);
  const formattedTotal = isNaN(rawPrecioTotal) ? '$0' : `$${rawPrecioTotal.toLocaleString('es-AR')}`;
  const rawPrecioUnitario = Number(
    purchase.precioUnitario ??
    purchase.entrada?.precioUnitario ??
    (cantidad > 0 ? Math.round(rawPrecioTotal / cantidad) : rawPrecioTotal)
  );
  const formattedUnitPrice = isNaN(rawPrecioUnitario) ? '$0' : `$${rawPrecioUnitario.toLocaleString('es-AR')}`;
  const displayFecha = purchase.eventoFechaTexto || 'Fecha a confirmar';
  const displayLugar = purchase.eventoLugar || 'Lugar a confirmar';
  const displayTipoEntrada = purchase.tipoEntradaNombre || 'Entrada General';
  const displayImagen = purchase.eventoImagen || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85';
  const diasFaltantes = Number(purchase.diasRestantes ?? purchase.diasFaltantesParaEvento ?? 0);
  const otherPurchasesForSameEvent = (purchases || []).filter(
    (p) => p.eventoId === purchase?.eventoId && p.id !== purchase?.id
  );

  const handleCancel = () => {
    Alert.alert(
      'Cancelar compra',
      '¿Estás seguro de que deseás cancelar esta compra? Se restituirá el cupo al organizador.',
      [
        { text: 'No, conservar', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              await cancelPurchase(purchase.id);
              const updated = await apiService.getCompraById(purchase.id);
              setPurchase(updated);
              Alert.alert('Compra cancelada', 'La compra fue cancelada con éxito.');
            } catch (err) {
              Alert.alert('Error', err.message || 'No se pudo cancelar la compra.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Detalle de compra"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner de la compra */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: displayImagen }} style={styles.bannerImage} resizeMode="cover" />
          <View style={styles.bannerGradient}>
            <StatusBadge status={purchase.estado} />
            <Text style={styles.bannerTitle} numberOfLines={2}>
              {purchase.eventoTitulo || 'Evento'}
            </Text>
          </View>
        </View>

        {/* Tarjetas de Información */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoMainText}>{displayFecha}</Text>
              <Text style={styles.infoSubText}>Fecha del evento</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="location-outline" size={16} color={COLORS.primary} />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoMainText} numberOfLines={1}>{displayLugar}</Text>
              <Text style={styles.infoSubText}>Lugar y acceso</Text>
            </View>
          </View>
        </View>

        {/* Desglose de Entradas */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Detalle del pedido</Text>

          <View style={styles.breakdownRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.breakdownItemBold}>{displayTipoEntrada}</Text>
              <Text style={styles.breakdownItemSub}>
                Precio: {formattedUnitPrice} c/u · {cantidad} {cantidad === 1 ? 'entrada' : 'entradas'}
              </Text>
            </View>
            <Text style={styles.breakdownPrice}>
              {formattedTotal}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.breakdownRow}>
            <Text style={styles.totalLabel}>Total abonado</Text>
            <Text style={styles.totalValue}>
              {formattedTotal}
            </Text>
          </View>
        </View>

        {/* Sección de Entradas Individuales */}
        <View style={styles.ticketsSection}>
          <View style={styles.ticketsSectionHeader}>
            <Text style={styles.ticketsSectionTitle}>
              Tus entradas ({cantidad})
            </Text>
            <Text style={styles.ticketsSectionSubtitle}>
              Pases individuales con código de acceso
            </Text>
          </View>

          {Array.from({ length: cantidad }).map((_, idx) => (
            <View key={`ticket-${idx}`} style={styles.individualTicketCard}>
              <View style={styles.individualTicketHeader}>
                <View style={styles.ticketBadgeRow}>
                  <Ionicons name="ticket" size={14} color={COLORS.primary} />
                  <Text style={styles.individualTicketBadgeText}>
                    Entrada {idx + 1} de {cantidad}
                  </Text>
                </View>
                <StatusBadge status={purchase.estado} size="sm" />
              </View>

              <View style={styles.individualTicketBody}>
                <View style={styles.ticketBodyCol}>
                  <Text style={styles.individualTicketType}>{displayTipoEntrada}</Text>
                  <Text style={styles.individualTicketPlace} numberOfLines={1}>
                    {displayLugar}
                  </Text>
                </View>
                <View style={styles.ticketBodyPriceCol}>
                  <Text style={styles.individualTicketPriceLabel}>Importe</Text>
                  <Text style={styles.individualTicketPriceVal}>{formattedUnitPrice}</Text>
                </View>
              </View>

              <View style={styles.ticketDashedLine} />

              <View style={styles.individualTicketFooter}>
                <View style={styles.barcodeIconWrap}>
                  <Ionicons name="barcode-outline" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.ticketCodeText}>
                    ACCESO: {purchase.id?.slice(0, 8).toUpperCase()}-{(idx + 1).toString().padStart(2, '0')}
                  </Text>
                </View>
                <Text style={styles.ticketAccessNotice}>Válido para 1 persona</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Otras compras para este mismo evento */}
        {otherPurchasesForSameEvent.length > 0 ? (
          <View style={styles.otherPurchasesSection}>
            <Text style={styles.otherPurchasesTitle}>
              Otras entradas tuyas para este evento ({otherPurchasesForSameEvent.length})
            </Text>
            {otherPurchasesForSameEvent.map((other) => (
              <TouchableOpacity
                key={other.id}
                style={styles.otherPurchaseCard}
                onPress={() =>
                  navigation.replace('PurchaseDetail', {
                    purchaseId: other.id,
                  })
                }
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.otherPurchaseType}>
                    {other.tipoEntradaNombre} · {other.cantidad} {other.cantidad === 1 ? 'entrada' : 'entradas'}
                  </Text>
                  <Text style={styles.otherPurchasePrice}>
                    ${Number(other.precioTotal || other.total || 0).toLocaleString('es-AR')}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <StatusBadge status={other.estado} size="sm" />
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Días restantes o Aviso de estado */}
        <View style={styles.statusNotice}>
          {isUtilizada ? (
            <View style={styles.noticeRow}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <Text style={styles.noticeTextPrimary}>Entrada utilizada. ¡Esperamos que hayas disfrutado el evento!</Text>
            </View>
          ) : isCancelada ? (
            <View style={styles.noticeRow}>
              <Ionicons name="close-circle" size={16} color={COLORS.accentRed} />
              <Text style={styles.noticeTextDanger}>Esta compra fue cancelada y el importe fue reintegrado.</Text>
            </View>
          ) : diasFaltantes > 0 ? (
            <View style={styles.noticeRow}>
              <Ionicons name="time-outline" size={16} color={COLORS.accentGreen} />
              <Text style={styles.noticeTextSuccess}>
                Faltan {diasFaltantes} días para el evento
              </Text>
            </View>
          ) : (
            <View style={styles.noticeRow}>
              <Ionicons name="alert-circle-outline" size={16} color={COLORS.accentAmber} />
              <Text style={styles.noticeTextWarning}>El evento es hoy o está por comenzar</Text>
            </View>
          )}
        </View>

        {/* Acciones principales */}
        <View style={styles.actionsContainer}>
          {/* Escribir al organizador */}
          <PrimaryButton
            title="Escribir al organizador"
            icon={<Ionicons name="chatbubble-ellipses-outline" size={16} color={COLORS.surface} />}
            onPress={() =>
              navigation.navigate('Chat', {
                purchaseId: purchase.id,
                title: purchase.eventoTitulo,
              })
            }
            style={styles.actionBtn}
          />

          {/* Calificar evento si está utilizada */}
          {isUtilizada ? (
            <SecondaryButton
              title="Calificar evento"
              variant="outline"
              icon={<Ionicons name="star-outline" size={16} color={COLORS.primary} />}
              onPress={() =>
                navigation.navigate('Review', {
                  purchaseId: purchase.id,
                  eventId: purchase.eventoId,
                  eventTitle: purchase.eventoTitulo,
                  eventImage: purchase.eventoImagen,
                })
              }
              style={styles.actionBtn}
            />
          ) : null}

          {/* Cancelar compra si está confirmada o pendiente */}
          {!isCancelada && !isUtilizada ? (
            <SecondaryButton
              title="Cancelar compra"
              variant="danger"
              disabled={cancelling}
              onPress={handleCancel}
              style={styles.cancelBtn}
            />
          ) : null}
        </View>
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
  bannerContainer: {
    height: 160,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: SPACING.md,
    ...SHADOWS.subtle,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: 'rgba(53, 55, 53, 0.6)',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.surface,
    marginTop: 6,
  },
  infoRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.xs + 2,
  },
  infoTextCol: {
    flex: 1,
  },
  infoMainText: {
    fontSize: 11,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  infoSubText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  breakdownCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.subtle,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  breakdownItemBold: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  breakdownItemSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  breakdownItem: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  breakdownPrice: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  ticketsSection: {
    marginBottom: SPACING.md,
  },
  ticketsSectionHeader: {
    marginBottom: SPACING.sm,
  },
  ticketsSectionTitle: {
    fontSize: 14,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  ticketsSectionSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  individualTicketCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.subtle,
  },
  individualTicketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ticketBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  individualTicketBadgeText: {
    fontSize: 11,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  individualTicketBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  ticketBodyCol: {
    flex: 1,
  },
  individualTicketType: {
    fontSize: 14,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  individualTicketPlace: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ticketBodyPriceCol: {
    alignItems: 'flex-end',
  },
  individualTicketPriceLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  individualTicketPriceVal: {
    fontSize: 14,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
  ticketDashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    marginVertical: SPACING.xs,
  },
  individualTicketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  barcodeIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketCodeText: {
    fontSize: 11,
    fontWeight: FONTS.semiBold,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: COLORS.textPrimary,
  },
  ticketAccessNotice: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  otherPurchasesSection: {
    marginBottom: SPACING.md,
  },
  otherPurchasesTitle: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  otherPurchaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  otherPurchaseType: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  otherPurchasePrice: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusNotice: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noticeTextSuccess: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.accentGreen,
  },
  noticeTextPrimary: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.primary,
  },
  noticeTextDanger: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.accentRed,
  },
  noticeTextWarning: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.accentAmber,
  },
  actionsContainer: {
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  actionBtn: {
    marginBottom: SPACING.xs,
  },
  cancelBtn: {
    marginTop: SPACING.xs,
  },
});
