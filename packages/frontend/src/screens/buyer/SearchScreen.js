import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext.js';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants/theme.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { SearchBar } from '../../components/common/SearchBar.js';
import { CategorySelector } from '../../components/common/CategorySelector.js';
import { EventCard } from '../../components/events/EventCard.js';
import { EmptyState } from '../../components/common/EmptyState.js';

const SORT_OPTIONS = [
  { id: 'default', label: 'Predeterminado' },
  { id: 'precio_asc', label: 'Precio: menor a mayor' },
  { id: 'precio_desc', label: 'Precio: mayor a menor' },
  { id: 'fecha_asc', label: 'Fecha más próxima' },
  { id: 'puntaje_organizador', label: 'Mejor puntuación organizador' },
];

export const SearchScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { events, categories, isFavorite, toggleFavorite } = useApp();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('default');
  const [showSortModal, setShowSortModal] = useState(false);

  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Texto
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.nombre.toLowerCase().includes(q) ||
          e.descripcion.toLowerCase().includes(q) ||
          e.ubicacion.toLowerCase().includes(q) ||
          (e.categoriaNombre && e.categoriaNombre.toLowerCase().includes(q))
      );
    }

    // Categoría
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((e) => e.categoriaId === selectedCategory);
    }

    // Orden
    switch (sortOption) {
      case 'precio_asc':
        result.sort((a, b) => a.precioMinimo - b.precioMinimo);
        break;
      case 'precio_desc':
        result.sort((a, b) => b.precioMinimo - a.precioMinimo);
        break;
      case 'fecha_asc':
        result.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        break;
      case 'puntaje_organizador':
        result.sort((a, b) => (b.organizadorPuntaje || 0) - (a.organizadorPuntaje || 0));
        break;
      default:
        break;
    }

    return result;
  }, [events, query, selectedCategory, sortOption]);

  const activeSortLabel = SORT_OPTIONS.find((s) => s.id === sortOption)?.label || 'Ordenar';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Buscar eventos"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => setShowSortModal(true)}
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
          onPress={() => setShowSortModal(true)}
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
              onPress={() => navigation.navigate('EventDetail', { eventId: evt.id })}
            />
          ))
        ) : (
          <EmptyState
            icon="search-outline"
            title="Sin resultados"
            message={`No encontramos eventos que coincidan con "${query}". Intentá con otros términos o categorías.`}
            actionLabel="Limpiar búsqueda"
            onAction={() => {
              setQuery('');
              setSelectedCategory('all');
              setSortOption('default');
            }}
          />
        )}
      </ScrollView>

      {/* Modal de Ordenamiento */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ordenar eventos por</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {SORT_OPTIONS.map((opt) => {
              const isSelected = sortOption === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.sortItem, isSelected && styles.sortItemSelected]}
                  onPress={() => {
                    setSortOption(opt.id);
                    setShowSortModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.sortItemText,
                      isSelected && styles.sortItemTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {isSelected ? (
                    <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
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
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '65%',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.primary,
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  sortItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sortItemSelected: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  sortItemText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  sortItemTextSelected: {
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
});
