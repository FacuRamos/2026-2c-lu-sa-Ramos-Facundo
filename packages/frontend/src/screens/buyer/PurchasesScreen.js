import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../constants/theme.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { PurchaseCard } from '../../components/purchases/PurchaseCard.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { PurchaseTabs } from '../../components/purchases/PurchaseTabs.js';
import { usePurchases } from '../../hooks/usePurchases.js';

export const PurchasesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    activeTab,
    setActiveTab,
    filteredPurchases,
    refreshing,
    onRefresh,
    tabs,
  } = usePurchases();

  const handleNavigateToDetail = useCallback(
    (purchaseId) => {
      navigation.navigate('PurchaseDetail', { purchaseId });
    },
    [navigation]
  );

  const handleNavigateToHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Mis compras" showNotificationBell={true} />

      {/* Pestañas de Filtrado extraídas a subcomponente */}
      <PurchaseTabs
        tabs={tabs}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

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
              onPress={() => handleNavigateToDetail(purchase.id)}
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
            onAction={activeTab === 'Todas' ? handleNavigateToHome : null}
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
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxxl,
  },
});
