import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext.js';
import { COLORS, SPACING, FONTS, RADIUS, SHADOWS } from '../../constants/theme.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { StatCard } from '../../components/organizer/StatCard.js';
import { QuickAction } from '../../components/organizer/QuickAction.js';
import { EventCard } from '../../components/events/EventCard.js';
import { PrimaryButton } from '../../components/common/PrimaryButton.js';
import { NotificationBell } from '../../components/notifications/NotificationBell.js';
import { USER_ROLES } from '../../constants/roles.js';

export const OrganizerDashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    currentUser,
    events,
    organizerStats,
    switchRole,
    refreshData,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // Mis eventos organizados
  const myEvents = events.filter((e) => e.organizadorId === currentUser.id);

  const totalSold = organizerStats?.entradasVendidas || 1182;
  const eventsCount = myEvents.length || 3;
  const totalRevenue = organizerStats?.ingresosTotales
    ? `$${(organizerStats.ingresosTotales / 1000000).toFixed(1)}M`
    : '$24.5M';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        showLogo
        rightAction={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <NotificationBell />
            <TouchableOpacity
              style={styles.switchBadge}
              onPress={() => {
                switchRole(USER_ROLES.BUYER);
                navigation.navigate('BuyerTabs');
              }}
              accessibilityLabel="Volver al modo Comprador"
            >
              <Ionicons name="swap-horizontal" size={14} color={COLORS.primary} />
              <Text style={styles.switchBadgeText}>Comprador</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Cabecera del Organizador */}
        <View style={styles.headerSection}>
          <Text style={styles.tagline}>Espacio organizador</Text>
          <Text style={styles.orgName}>
            Hola, {currentUser.nombre} {currentUser.apellido}
          </Text>
        </View>

        {/* Métricas Principales */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Eventos publicados"
            value={String(eventsCount)}
            subtext="En cartelera activa"
          />
          <StatCard
            label="Entradas vendidas"
            value={totalSold.toLocaleString('es-AR')}
            subtext="Acumulado"
          />
        </View>

        {/* Botón Crear Evento */}
        <PrimaryButton
          title="Crear nuevo evento"
          icon={<Ionicons name="add-circle-outline" size={18} color={COLORS.surface} />}
          onPress={() => navigation.navigate('CreateEvent')}
          style={styles.createBtn}
        />

        {/* Accesos Rápidos */}
        <View style={styles.quickGrid}>
          <QuickAction
            icon="people-outline"
            text="Ventas"
            onPress={() => navigation.navigate('OrganizerSales')}
          />
          <QuickAction
            icon="chatbubbles-outline"
            text="Mensajes"
            onPress={() => navigation.navigate('OrganizerInbox')}
          />
          <QuickAction
            icon="add-outline"
            text="Nuevo"
            onPress={() => navigation.navigate('CreateEvent')}
          />
        </View>

        {/* Sección Mis Eventos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mis eventos</Text>
          <Text style={styles.eventsCountBadge}>{myEvents.length} eventos</Text>
        </View>

        <View style={styles.eventsList}>
          {myEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              compact
              onPress={() => navigation.navigate('ManageEvent', { eventId: evt.id })}
            />
          ))}
        </View>

        {/* Banner de Crecimiento */}
        <View style={styles.growthBanner}>
          <Ionicons name="trending-up" size={20} color={COLORS.accentGreen} />
          <Text style={styles.growthText}>
            Tus ventas crecieron un 18% este mes respecto al período anterior.
          </Text>
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
  switchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 5,
    borderRadius: RADIUS.round,
  },
  switchBadgeText: {
    fontSize: 11,
    fontWeight: FONTS.semiBold,
    color: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  headerSection: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  tagline: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  orgName: {
    fontSize: 22,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  createBtn: {
    marginBottom: SPACING.lg,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  eventsCountBadge: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  eventsList: {
    marginBottom: SPACING.xl,
  },
  growthBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.subtle,
  },
  growthText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
