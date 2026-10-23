import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext.js';
import { COLORS, SPACING, FONTS } from '../../constants/theme.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { EventCard } from '../../components/events/EventCard.js';
import { EmptyState } from '../../components/common/EmptyState.js';

export const FavoritesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { events, favorites, isFavorite, toggleFavorite } = useApp();

  const favoriteEvents = events.filter((e) => favorites.includes(e.id));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Favoritos" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {favoriteEvents.length > 0 ? (
          <>
            <Text style={styles.countText}>
              {favoriteEvents.length} {favoriteEvents.length === 1 ? 'evento guardado' : 'eventos guardados'}
            </Text>

            {favoriteEvents.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                compact
                isFavorite={isFavorite(evt.id)}
                onToggleFavorite={() => toggleFavorite(evt.id)}
                onPress={() => navigation.navigate('EventDetail', { eventId: evt.id })}
              />
            ))}
          </>
        ) : (
          <EmptyState
            icon="heart-outline"
            title="Aún no tenés favoritos"
            message="Guardá los eventos que más te interesen para encontrarlos rápidamente y no perderte ninguna novedad."
            actionLabel="Explorar eventos"
            onAction={() => navigation.navigate('Home')}
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
  countText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
    marginBottom: SPACING.md,
  },
});
