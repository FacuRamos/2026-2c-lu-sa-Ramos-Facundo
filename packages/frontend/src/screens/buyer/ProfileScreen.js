import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext.js';
import { COLORS, SPACING, FONTS, RADIUS, SHADOWS } from '../../constants/theme.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { USER_ROLES } from '../../constants/roles.js';

export const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { currentUser, userRole, switchRole, purchases, favorites } = useApp();

  const handleToggleRole = () => {
    const nextRole =
      userRole === USER_ROLES.BUYER ? USER_ROLES.ORGANIZER : USER_ROLES.BUYER;
    switchRole(nextRole);
    if (nextRole === USER_ROLES.ORGANIZER) {
      navigation.navigate('OrganizerDashboard');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Mi perfil" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Tarjeta de Usuario */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{currentUser.avatar || 'US'}</Text>
          </View>
          <Text style={styles.userName}>
            {currentUser.nombre} {currentUser.apellido}
          </Text>
          <Text style={styles.userEmail}>{currentUser.email}</Text>
          {currentUser.telefono ? (
            <Text style={styles.userPhone}>{currentUser.telefono}</Text>
          ) : null}

          {/* Estadísticas de Comprador */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{purchases.length}</Text>
              <Text style={styles.statLabel}>Compras</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{favorites.length}</Text>
              <Text style={styles.statLabel}>Favoritos</Text>
            </View>
          </View>
        </View>

        {/* Tarjeta de Cambio de Modo / Perfil */}
        <TouchableOpacity
          style={styles.switchRoleCard}
          onPress={handleToggleRole}
          activeOpacity={0.8}
        >
          <View style={styles.switchIconBox}>
            <Ionicons name="briefcase-outline" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.switchTextBox}>
            <Text style={styles.switchTitle}>Modo Organizador</Text>
            <Text style={styles.switchSubtitle}>
              Publicá eventos, administrá ventas y respondé consultas
            </Text>
          </View>
          <Ionicons name="swap-horizontal" size={20} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Menú de Opciones */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              switchRole(USER_ROLES.ORGANIZER);
              navigation.navigate('OrganizerDashboard');
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: COLORS.primary, fontWeight: FONTS.semiBold }]}>
              Crear y gestionar eventos
            </Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Purchases')}
          >
            <Ionicons name="ticket-outline" size={20} color={COLORS.textPrimary} style={styles.menuIcon} />
            <Text style={styles.menuText}>Historial de compras</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Favorites')}
          >
            <Ionicons name="heart-outline" size={20} color={COLORS.textPrimary} style={styles.menuIcon} />
            <Text style={styles.menuText}>Eventos guardados</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Notification')}
          >
            <Ionicons name="notifications-outline" size={20} color={COLORS.textPrimary} style={styles.menuIcon} />
            <Text style={styles.menuText}>Centro de Notificaciones</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons name="log-in-outline" size={20} color={COLORS.primary} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: COLORS.primary }]}>Cambiar de cuenta / Login</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemLast]}
            onPress={() => Alert.alert('Soporte', 'Centro de ayuda y atención al cliente: soporte@aiticketit.com')}
          >
            <Ionicons name="help-circle-outline" size={20} color={COLORS.textPrimary} style={styles.menuIcon} />
            <Text style={styles.menuText}>Ayuda y contacto</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>AI Ticket It · Versión 1.0.0 (Expo React Native)</Text>
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
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxxl,
  },
  userCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.subtle,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
  userName: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    width: '100%',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.borderLight,
  },
  switchRoleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(70, 113, 122, 0.3)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.subtle,
  },
  switchIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  switchTextBox: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  switchSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    ...SHADOWS.subtle,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    marginRight: SPACING.md,
  },
  menuText: {
    flex: 1,
    fontSize: 13,
    fontWeight: FONTS.medium,
    color: COLORS.textPrimary,
  },
  versionText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
