import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext.js';
import { PURCHASE_TABS, filterPurchases } from './filterHelpers.js';

export { PURCHASE_TABS };

/**
 * Custom Hook para gestionar el listado y filtrado de compras del comprador.
 * Separa la lógica de filtrado por estados y pull-to-refresh de la vista PurchasesScreen.
 */
export function usePurchases() {
  const { purchases, refreshData } = useApp();
  const [activeTab, setActiveTab] = useState('Todas');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  const filteredPurchases = useMemo(() => {
    return filterPurchases(purchases, activeTab);
  }, [purchases, activeTab]);

  return {
    purchases,
    activeTab,
    setActiveTab,
    filteredPurchases,
    refreshing,
    onRefresh,
    tabs: PURCHASE_TABS,
  };
}
