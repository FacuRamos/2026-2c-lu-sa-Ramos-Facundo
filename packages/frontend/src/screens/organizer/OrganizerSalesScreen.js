import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext.js';
import { apiService } from '../../services/apiService.js';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants/theme.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { SaleItem } from '../../components/organizer/SaleItem.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

const FILTER_TABS = ['Todas', 'Confirmada', 'Pendiente', 'Utilizada', 'Cancelada'];

export const OrganizerSalesScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { eventId, eventTitle } = route.params || {};
  const { currentUser } = useApp();

  const [sales, setSales] = useState([]);
  const [activeTab, setActiveTab] = useState('Todas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSales() {
      try {
        setLoading(true);
        let list;
        if (eventId) {
          list = await apiService.getComprasByEvento(eventId);
        } else {
          list = await apiService.getComprasByOrganizador(currentUser.id);
        }
        setSales(list);
      } catch (err) {
        Alert.alert('Error', err.message || 'No se pudieron cargar las compras');
      } finally {
        setLoading(false);
      }
    }

    loadSales();
  }, [eventId, currentUser.id]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Cargando compras..." />;
  }

  const filteredSales = sales.filter((s) => {
    if (activeTab === 'Todas') return true;
    return s.estado.toUpperCase() === activeTab.toUpperCase();
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={eventTitle ? `Compras: ${eventTitle}` : 'Compras del evento'}
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Meta Bar */}
      <View style={styles.metaBar}>
        <Text style={styles.metaCount}>
          {sales.length} {sales.length === 1 ? 'compra registrada' : 'compras registradas'}
        </Text>
        <StatusBadge status="confirmada" size="sm" />
      </View>

      {/* Pestañas de Filtro */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {FILTER_TABS.map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabPill, isSelected ? styles.tabSelected : styles.tabDefault]}
              >
                <Text
                  style={[
                    styles.tabText,
                    isSelected ? styles.tabTextSelected : styles.tabTextDefault,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Listado de Ventas */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredSales.length > 0 ? (
          filteredSales.map((sale) => (
            <SaleItem
              key={sale.id}
              name={sale.compradorNombre}
              type={`${sale.tipoEntradaNombre} · ${sale.cantidad} ${sale.cantidad === 1 ? 'entrada' : 'entradas'}`}
              price={sale.precioTotal}
              status={sale.estado}
            />
          ))
        ) : (
          <EmptyState
            icon="receipt-outline"
            title="Sin compras registradas"
            message={`No hay transacciones registradas con el estado "${activeTab}".`}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  metaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xs + 2,
    marginBottom: SPACING.xs,
  },
  metaCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  tabsWrapper: {
    paddingLeft: SPACING.xl,
    marginBottom: SPACING.md,
  },
  tabsScroll: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingRight: SPACING.xl,
  },
  tabPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.round,
  },
  tabDefault: {
    backgroundColor: COLORS.backgroundSecondary,
  },
  tabSelected: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
  },
  tabTextDefault: {
    color: COLORS.textSecondary,
  },
  tabTextSelected: {
    color: COLORS.surface,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
});
