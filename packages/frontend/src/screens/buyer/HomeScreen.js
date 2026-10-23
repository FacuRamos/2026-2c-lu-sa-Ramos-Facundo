import React, { useCallback } from 'react';
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
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants/theme.js';
import { USER_ROLES } from '../../constants/roles.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { SearchBar } from '../../components/common/SearchBar.js';
import { CategorySelector } from '../../components/common/CategorySelector.js';
import { EventCard } from '../../components/events/EventCard.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { HomeGreeting } from '../../components/home/HomeGreeting.js';
import { useEvents } from '../../hooks/useEvents.js';

export const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    currentUser,
    categories,
    isLoading,
    refreshing,
    onRefresh,
    selectedCategory,
    setSelectedCategory,
    filteredEvents,
    featuredEvents,
    otherEvents,
    isFavorite,
    toggleFavorite,
    switchRole,
  } = useEvents();

  const handleNavigateToSearch = useCallback(() => {
    navigation.navigate('Search');
  }, [navigation]);

  const handleSwitchToOrganizer = useCallback(() => {
    switchRole(USER_ROLES.ORGANIZER);
    navigation.navigate('OrganizerDashboard');
  }, [switchRole, navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        showLogo
        rightAction={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleNavigateToSearch}
              style={styles.iconBtn}
              accessibilityLabel="Buscar"
            >
              <Ionicons name="search-outline" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSwitchToOrganizer}
              style={styles.roleBadge}
              accessibilityLabel="Cambiar a Modo Organizador"
            >
              <Ionicons name="swap-horizontal" size={14} color={COLORS.primary} />
              <Text style={styles.roleText}>Modo Org</Text>
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
        {/* Saludo y Título extraído a componente atómico */}
        <HomeGreeting userName={currentUser?.nombre} />

        {/* Buscador de acceso rápido */}
        <View style={styles.searchSection}>
          <SearchBar
            editable={false}
            onPress={handleNavigateToSearch}
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
                  <TouchableOpacity onPress={handleNavigateToSearch}>
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
                <TouchableOpacity onPress={handleNavigateToSearch}>
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
    gap: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
  },
  roleText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
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
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: FONTS.sizes.xs,
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
