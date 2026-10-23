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
import { apiService } from '../../services/apiService.js';
import { COLORS, SPACING, FONTS, RADIUS, SHADOWS } from '../../constants/theme.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { StatCard } from '../../components/organizer/StatCard.js';
import { QuickAction } from '../../components/organizer/QuickAction.js';
import { TicketStockBar } from '../../components/organizer/TicketStockBar.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const ManageEventScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { eventId } = route.params || {};

  const [event, setEvent] = useState(null);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [evt, cmpList] = await Promise.all([
          apiService.getEventoById(eventId),
          apiService.getComprasByEvento(eventId),
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
  }, [eventId, navigation]);

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
        <Image source={{ uri: event.imagen }} style={styles.bannerImage} resizeMode="cover" />

        <Text style={styles.eventTitle}>{event.nombre}</Text>
        <Text style={styles.eventSubtitle}>
          {event.fechaTexto} · {event.ubicacion}
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
    ...SHADOWS.subtle,
  },
});
