import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext.js';
import { apiService } from '../../services/apiService.js';
import { COLORS, SPACING, FONTS, RADIUS, SHADOWS } from '../../constants/theme.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { StatCard } from '../../components/organizer/StatCard.js';
import { QuickAction } from '../../components/organizer/QuickAction.js';
import { TicketStockBar } from '../../components/organizer/TicketStockBar.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const ManageEventScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { eventId } = route.params || {};
  const { currentUser } = useApp();

  const [event, setEvent] = useState(null);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketFlowStatus, setTicketFlowStatus] = useState('CONFIRMADA');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [evt, cmpList] = await Promise.all([
          apiService.getEventoById(eventId),
          apiService.getComprasByEvento(eventId, currentUser?.id),
        ]);
        setEvent(evt);
        setCompras(cmpList);
      } catch (err) {
        Alert.alert('Error', err.message || 'No se pudo cargar el evento');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      loadData();
    }
  }, [eventId, currentUser?.id, navigation]);

  if (loading || !event) {
    return <LoadingSpinner fullScreen message="Cargando panel de gestión..." />;
  }

  // Cálculos de ventas
  let totalSold = 0;
  let totalAvailable = 0;
  let totalRevenue = 0;

  if (event.tiposEntrada) {
    event.tiposEntrada.forEach((t) => {
      const sold = t.cupo - t.cupoDisponible;
      totalSold += sold;
      totalAvailable += t.cupoDisponible;
      totalRevenue += sold * t.precio;
    });
  }

  const formattedRevenue =
    totalRevenue >= 1000000
      ? `$${(totalRevenue / 1000000).toFixed(1)}M`
      : `$${(totalRevenue / 1000).toFixed(0)}k`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Gestionar evento"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() =>
              Alert.alert('Configuración', 'Opciones de pausar ventas, clonar o editar fecha.')
            }
          >
            <Ionicons name="settings-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner */}
        <Image
          source={{ uri: event.imagen || event.multimedia?.[0] || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85' }}
          style={styles.bannerImage}
          resizeMode="cover"
        />

        <Text style={styles.eventTitle}>{event.nombre}</Text>
        <Text style={styles.eventSubtitle}>
          {event.fechaTexto || 'Próximamente'} · {event.ubicacion || 'Buenos Aires'}
        </Text>

        {/* Métricas del Evento */}
        <View style={styles.metricsRow}>
          <StatCard label="Vendidas" value={String(totalSold)} />
          <StatCard label="Disponibles" value={String(totalAvailable)} />
          <StatCard label="Ingresos" value={formattedRevenue} />
        </View>

        {/* Acciones Rápidas */}
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            icon="people-outline"
            text="Compras"
            onPress={() =>
              navigation.navigate('OrganizerSales', {
                eventId: event.id,
                eventTitle: event.nombre,
              })
            }
          />
          <QuickAction
            icon="chatbubbles-outline"
            text="Mensajes"
            onPress={() =>
              navigation.navigate('OrganizerInbox', {
                eventId: event.id,
              })
            }
          />
          <QuickAction
            icon="star-outline"
            text="Reseñas"
            onPress={() =>
              Alert.alert(
                'Reseñas del evento',
                `Puntaje promedio del organizador: ${event.organizadorPuntaje || 5.0} ★`
              )
            }
          />
        </View>

        {/* Disponibilidad por Tipo de Entrada */}
        <Text style={styles.sectionTitle}>Disponibilidad por entrada</Text>
        <View style={styles.availabilityCard}>
          {event.tiposEntrada &&
            event.tiposEntrada.map((t) => {
              const sold = t.cupo - t.cupoDisponible;
              return (
                <TicketStockBar
                  key={t.id}
                  name={t.nombre}
                  sold={sold}
                  total={t.cupo}
                />
              );
            })}
        </View>

        {/* Flujo de Estados Interactivo */}
        <View style={styles.flowHeader}>
          <Text style={styles.sectionTitle}>Flujo de estados</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('OrganizerSales', {
                eventId: event.id,
                eventTitle: event.nombre,
              })
            }
          >
            <Text style={styles.flowHeaderAction}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.flowCard}>
          <View style={styles.flowCardHeader}>
            <View style={styles.flowCardInfo}>
              <Text style={styles.flowCardTitle}>
                Estado de la compra de {compras[0]?.compradorNombre || 'Martina G.'}
              </Text>
              <Text style={styles.flowCardSubtitle}>
                El organizador puede avanzar o revertir el estado.
              </Text>
            </View>
            <StatusBadge status={ticketFlowStatus} size="sm" />
          </View>

          <View style={styles.statusButtonsGrid}>
            {['PENDIENTE', 'CONFIRMADA', 'UTILIZADA', 'CANCELADA'].map((st) => {
              const isSelected = ticketFlowStatus.toUpperCase() === st;
              const label =
                st === 'PENDIENTE'
                  ? 'Pendiente'
                  : st === 'CONFIRMADA'
                  ? 'Confirmada'
                  : st === 'UTILIZADA'
                  ? 'Utilizada'
                  : 'Cancelada';
              return (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.statusBtn,
                    isSelected ? styles.statusBtnSelected : styles.statusBtnDefault,
                  ]}
                  onPress={() => setTicketFlowStatus(st)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.statusBtnText,
                      isSelected ? styles.statusBtnTextSelected : styles.statusBtnTextDefault,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.feedbackRow}>
            <Ionicons name="checkmark" size={14} color={COLORS.accentGreen} />
            <Text style={styles.feedbackText}>Vista del comprador actualizada</Text>
          </View>
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
  settingsBtn: {
    padding: SPACING.xs,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxxl,
  },
  bannerImage: {
    height: 140,
    width: '100%',
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.backgroundSecondary,
    marginBottom: SPACING.md,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  eventSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  availabilityCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.subtle,
  },
  flowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  flowHeaderAction: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: FONTS.semiBold,
  },
  flowCard: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(70, 113, 122, 0.25)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  flowCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  flowCardInfo: {
    flex: 1,
  },
  flowCardTitle: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  flowCardSubtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusButtonsGrid: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: SPACING.md,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBtnSelected: {
    backgroundColor: COLORS.primary,
  },
  statusBtnDefault: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusBtnText: {
    fontSize: 9.5,
    fontWeight: FONTS.medium,
  },
  statusBtnTextSelected: {
    color: COLORS.surface,
    fontWeight: FONTS.bold,
  },
  statusBtnTextDefault: {
    color: COLORS.textSecondary,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  feedbackText: {
    fontSize: 10,
    color: COLORS.accentGreen,
    fontWeight: FONTS.medium,
  },
});
