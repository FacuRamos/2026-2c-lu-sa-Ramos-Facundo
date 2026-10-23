import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext.js';
import { SORT_OPTIONS, filterAndSortEvents } from './filterHelpers.js';

export { SORT_OPTIONS };

/**
 * Custom Hook para búsqueda, filtrado y ordenamiento multi-criterio de eventos.
 * Separa la lógica algorítmica y de estado de la vista de SearchScreen.
 */
export function useEventSearch() {
  const { events, categories, isFavorite, toggleFavorite } = useApp();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('default');
  const [showSortModal, setShowSortModal] = useState(false);

  const filteredEvents = useMemo(() => {
    return filterAndSortEvents(events, {
      query,
      selectedCategory,
      sortOption,
    });
  }, [events, query, selectedCategory, sortOption]);

  const activeSortLabel = useMemo(() => {
    return SORT_OPTIONS.find((s) => s.id === sortOption)?.label || 'Ordenar';
  }, [sortOption]);

  const clearFilters = useCallback(() => {
    setQuery('');
    setSelectedCategory('all');
    setSortOption('default');
  }, []);

  return {
    events,
    categories,
    isFavorite,
    toggleFavorite,
    query,
    setQuery,
    selectedCategory,
    setSelectedCategory,
    sortOption,
    setSortOption,
    showSortModal,
    setShowSortModal,
    filteredEvents,
    activeSortLabel,
    clearFilters,
    sortOptions: SORT_OPTIONS,
  };
}
