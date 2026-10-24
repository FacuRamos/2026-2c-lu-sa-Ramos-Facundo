import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../../context/NotificationContext.js';
import { NotificationItem } from '../../components/notifications/NotificationItem.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme.js';

export const NotificationScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    notificaciones,
    unreadCount,
    marcarComoLeida,
    marcarTodasComoLeidas,
    cargarNotificaciones,
    isLoading,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('todas'); // 'todas' | 'no_leidas'

  const filteredNotificaciones = useMemo(() => {
    if (activeTab === 'no_leidas') {
      return notificaciones.filter((n) => !n.leida);
    }
    return notificaciones;
  }, [notificaciones, activeTab]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Centro de Notificaciones"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity
              onPress={marcarTodasComoLeidas}
              style={styles.markAllButton}
              activeOpacity={0.7}
            >
              <Text style={styles.markAllText}>Leídas</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'todas' && styles.activeTab]}
          onPress={() => setActiveTab('todas')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'todas' && styles.activeTabText]}>
            Todas ({notificaciones.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'no_leidas' && styles.activeTab]}
          onPress={() => setActiveTab('no_leidas')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'no_leidas' && styles.activeTabText]}>
            No leídas ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={filteredNotificaciones}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notificacion={item}
            onPress={(id) => marcarComoLeida(id)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          filteredNotificaciones.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={cargarNotificaciones}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={36} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Sin notificaciones</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'no_leidas'
                ? '¡Estás al día! No tenés notificaciones pendientes.'
                : 'Todavía no recibiste notificaciones.'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  markAllButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
