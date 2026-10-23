import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext.js';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants/theme.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { PurchaseCard } from '../../components/purchases/PurchaseCard.js';
import { EmptyState } from '../../components/common/EmptyState.js';

const TABS = ['Todas', 'Próximas', 'Pasadas'];

export const PurchasesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { purchases, refreshData } = useApp();
  const [activeTab, setActiveTab] = useState('Todas');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const filteredPurchases = purchases.filter((p) => {
    if (activeTab === 'Todas') return true;
    if (activeTab === 'Próximas') {
      return p.estado === 'CONFIRMADA' || p.estado === 'PENDIENTE';
    }
    if (activeTab === 'Pasadas') {
      return p.estado === 'UTILIZADA' || p.estado === 'CANCELADA';
    }
    return true;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Mis compras" />

      {/* Pestañas de Filtrado */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
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
      </View>

      {/* Listado */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {filteredPurchases.length > 0 ? (
          filteredPurchases.map((purchase) => (
            <PurchaseCard
              key={purchase.id}
              purchase={purchase}
              onPress={() =>
                navigation.navigate('PurchaseDetail', {
                  purchaseId: purchase.id,
                })
              }
            />
          ))
        ) : (
          <EmptyState
            icon="ticket-outline"
            title="Sin compras en esta categoría"
            message={
              activeTab === 'Todas'
                ? 'Aún no tenés compras registradas. ¡Encontrá eventos imperdibles en el inicio!'
                : `No tenés entradas en la categoría "${activeTab.toLowerCase()}".`
            }
            actionLabel={activeTab === 'Todas' ? 'Explorar eventos' : null}
            onAction={activeTab === 'Todas' ? () => navigation.navigate('Home') : null}
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
  tabsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.xs,
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
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxxl,
  },
});
