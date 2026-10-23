import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext.js';
import { partitionEvents } from './filterHelpers.js';

/**
 * Custom Hook para gestionar eventos en la vista principal (Home).
 * Encapsula la lógica de filtrado por categoría, división en destacados y
 * eventos regulares, y el refresco con pull-to-refresh.
 */
export function useEvents() {
  const {
    currentUser,
    events,
    categories,
    isLoading,
    refreshData,
    isFavorite,
    toggleFavorite,
    switchRole,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  const { filtered, featured, other } = useMemo(() => {
    return partitionEvents(events, selectedCategory);
  }, [events, selectedCategory]);

  return {
    currentUser,
    events,
    categories,
    isLoading,
    refreshing,
    onRefresh,
    selectedCategory,
    setSelectedCategory,
    filteredEvents: filtered,
    featuredEvents: featured,
    otherEvents: other,
    isFavorite,
    toggleFavorite,
    switchRole,
  };
}
