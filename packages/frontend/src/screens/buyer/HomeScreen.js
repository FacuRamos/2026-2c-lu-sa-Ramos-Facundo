import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext.js';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants/theme.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { SearchBar } from '../../components/common/SearchBar.js';
import { CategorySelector } from '../../components/common/CategorySelector.js';
import { EventCard } from '../../components/events/EventCard.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
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

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const filteredEvents = events.filter((e) => {
    if (selectedCategory === 'all') return true;
    return e.categoriaId === selectedCategory;
  });

  const featuredEvents = filteredEvents.filter((e) => e.destacado);
  const otherEvents = filteredEvents.filter((e) => !e.destacado);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        showLogo
        rightAction={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Search')}
              style={styles.iconBtn}
              accessibilityLabel="Buscar"
            >
              <Ionicons name="search-outline" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => switchRole('Organizador')}
              style={styles.roleBadge}
              accessibilityLabel="Cambiar a Organizador"
            >
              <Ionicons name="swap-horizontal" size={14} color={COLORS.primary} />
              <Text style={styles.roleText}>Org</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Saludo y Titulo */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingSubtext}>Buen día, {currentUser.nombre}</Text>
          <Text style={styles.greetingTitle}>
            Encontrá tu próximo{'\n'}
            <Text style={styles.greetingAccent}>momento inolvidable.</Text>
          </Text>
        </View>

        {/* Buscador de acceso rápido */}
        <View style={styles.searchSection}>
          <SearchBar
            editable={false}
            onPress={() => navigation.navigate('Search')}
            placeholder="Buscá artistas, eventos o lugares..."
          />
        </View>

        {/* Categorías */}
        <View style={styles.categoriesSection}>
          <CategorySelector
            categories={categories}
            selectedCategoryId={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>

        {isLoading && !refreshing ? (
          <LoadingSpinner message="Cargando eventos..." />
        ) : (
          <>
            {/* Eventos Destacados */}
            {featuredEvents.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Destacados</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                    <Text style={styles.seeAllText}>Ver todos</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredScroll}
                >
                  {featuredEvents.map((evt) => (
                    <EventCard
                      key={evt.id}
                      event={evt}
                      isFavorite={isFavorite(evt.id)}
                      onToggleFavorite={() => toggleFavorite(evt.id)}
                      onPress={() => navigation.navigate('EventDetail', { eventId: evt.id })}
                      style={styles.featuredCard}
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {/* Para vos / Próximos eventos */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Para vos</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                  <Text style={styles.seeAllText}>Filtrar</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.listContainer}>
                {(otherEvents.length > 0 ? otherEvents : filteredEvents).map((evt) => (
                  <EventCard
                    key={evt.id}
                    event={evt}
                    compact
                    isFavorite={isFavorite(evt.id)}
                    onToggleFavorite={() => toggleFavorite(evt.id)}
                    onPress={() => navigation.navigate('EventDetail', { eventId: evt.id })}
                  />
                ))}
              </View>
            </View>
          </>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconBtn: {
    padding: SPACING.xs,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
  },
  roleText: {
    fontSize: 11,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  greetingSection: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  greetingSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginTop: 4,
    lineHeight: 30,
  },
  greetingAccent: {
    color: COLORS.primary,
  },
  searchSection: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  categoriesSection: {
    paddingLeft: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.primary,
  },
  featuredScroll: {
    paddingLeft: SPACING.xl,
    paddingRight: SPACING.md,
    gap: SPACING.md,
  },
  featuredCard: {
    marginRight: SPACING.sm,
  },
  listContainer: {
    paddingHorizontal: SPACING.xl,
  },
});
