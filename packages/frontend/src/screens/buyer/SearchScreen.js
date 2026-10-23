import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS } from '../../constants/theme.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { SearchBar } from '../../components/common/SearchBar.js';
import { CategorySelector } from '../../components/common/CategorySelector.js';
import { EventCard } from '../../components/events/EventCard.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { SortModal } from '../../components/search/SortModal.js';
import { useEventSearch } from '../../hooks/useEventSearch.js';

export const SearchScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
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
    sortOptions,
  } = useEventSearch();

  const handleOpenSortModal = useCallback(() => {
    setShowSortModal(true);
  }, [setShowSortModal]);

  const handleCloseSortModal = useCallback(() => {
    setShowSortModal(false);
  }, [setShowSortModal]);

  const handleNavigateToDetail = useCallback((eventId) => {
    navigation.navigate('EventDetail', { eventId });
  }, [navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Buscar eventos"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={handleOpenSortModal}
            style={styles.filterBtn}
            accessibilityLabel="Opciones de ordenamiento"
          >
            <Ionicons name="options-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchSection}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          placeholder="Música en vivo, teatro, deportes..."
          autoFocus={false}
        />
      </View>

      <View style={styles.categoriesSection}>
        <CategorySelector
          categories={categories}
          selectedCategoryId={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </View>

      {/* Resultados meta y selector de orden */}
      <View style={styles.metaRow}>
        <Text style={styles.resultsCount}>
          {filteredEvents.length} {filteredEvents.length === 1 ? 'resultado' : 'resultados'}
        </Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={handleOpenSortModal}
          activeOpacity={0.7}
        >
          <Text style={styles.sortButtonText} numberOfLines={1}>
            {sortOption === 'default' ? 'Ordenar' : activeSortLabel}
          </Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Listado de resultados */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {filteredEvents.length > 0 ? (
          filteredEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              compact
              isFavorite={isFavorite(evt.id)}
              onToggleFavorite={() => toggleFavorite(evt.id)}
              onPress={() => handleNavigateToDetail(evt.id)}
            />
          ))
        ) : (
          <EmptyState
            icon="search-outline"
            title="Sin resultados"
            message={`No encontramos eventos que coincidan con "${query}". Intentá con otros términos o categorías.`}
            actionLabel="Limpiar búsqueda"
            onAction={clearFilters}
          />
        )}
      </ScrollView>

      {/* Modal de Ordenamiento extraído a componente atómico */}
      <SortModal
        visible={showSortModal}
        options={sortOptions}
        selectedOption={sortOption}
        onSelectOption={setSortOption}
        onClose={handleCloseSortModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterBtn: {
    padding: SPACING.xs,
  },
  searchSection: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  categoriesSection: {
    paddingLeft: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  resultsCount: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    maxWidth: '65%',
  },
  sortButtonText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.semiBold,
    color: COLORS.primary,
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
});
