import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext.js';
import { apiService } from '../../services/apiService.js';
import { COLORS, SPACING, FONTS, RADIUS, SHADOWS } from '../../constants/theme.js';
import { PrimaryButton } from '../../components/common/PrimaryButton.js';
import { TicketTypeCard } from '../../components/events/TicketTypeCard.js';
import { RatingStars } from '../../components/common/RatingStars.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const EventDetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { eventId } = route.params || {};
  const { isFavorite, toggleFavorite } = useApp();

  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [organizerReviews, setOrganizerReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const evt = await apiService.getEventoById(eventId);
        setEvent(evt);

        const orgId = evt.organizadorId || evt.organizador?.id || evt.organizador;
        const [revs, orgRevsRes] = await Promise.all([
          apiService.getReseniasByEvento(eventId).catch(() => []),
          orgId ? apiService.getReseniasByOrganizador(orgId).catch(() => null) : Promise.resolve(null),
        ]);

        setReviews(Array.isArray(revs) ? revs : []);
        const rawOrgReviews = orgRevsRes?.resenias || (Array.isArray(orgRevsRes) ? orgRevsRes : []);
        const prevRevs = rawOrgReviews.filter((r) => r.eventoId !== eventId);
        setOrganizerReviews(prevRevs);
      } catch (err) {
        Alert.alert('Error', err.message || 'No se pudo cargar el evento');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      loadData();
    }
  }, [eventId, navigation]);

  if (loading || !event) {
    return <LoadingSpinner fullScreen message="Cargando detalle del evento..." />;
  }

  const formattedMinPrice = event.precioMinimo
    ? `$${Number(event.precioMinimo).toLocaleString('es-AR')}`
    : '$0';

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
      >
        {/* Cover Image con Botones Superpuestos */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: event.imagen }} style={styles.heroImage} resizeMode="cover" />
          <View style={[styles.heroOverlay, { paddingTop: insets.top + SPACING.sm }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.heroCircleBtn}
              accessibilityLabel="Volver"
            >
              <Ionicons name="arrow-back" size={18} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => toggleFavorite(event.id)}
              style={styles.heroCircleBtn}
              accessibilityLabel="Guardar en favoritos"
            >
              <Ionicons
                name={isFavorite(event.id) ? 'heart' : 'heart-outline'}
                size={18}
                color={isFavorite(event.id) ? COLORS.accentRed : COLORS.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Detalle y Cabecera del Evento */}
        <View style={styles.body}>
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {(event.categoriaNombre || 'EVENTO').toUpperCase()}
              </Text>
            </View>

            <View style={styles.ratingBox}>
              <Ionicons name="star" size={14} color={COLORS.star} />
              <Text style={styles.ratingNumber}>
                {event.organizadorPuntaje ? event.organizadorPuntaje.toFixed(1) : '5.0'}
              </Text>
            </View>
          </View>

          <Text style={styles.eventTitle}>{event.nombre}</Text>

          <Text style={styles.descriptionText}>{event.descripcion}</Text>

          {/* Tarjetas de Información Rápida */}
          <View style={styles.infoCardsRow}>
            <View style={styles.infoCard}>
              <Ionicons name="calendar" size={16} color={COLORS.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>{event.fechaTexto}</Text>
                <Text style={styles.infoSubtitle}>Apertura de puertas</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>{event.ubicacion}</Text>
                <Text style={styles.infoSubtitle}>{event.direccion || 'Buenos Aires'}</Text>
              </View>
            </View>
          </View>

          {/* Tarjeta del Organizador */}
          <View style={styles.organizerCard}>
            <View style={styles.organizerAvatar}>
              <Text style={styles.organizerInitials}>
                {event.organizadorIniciales || 'LP'}
              </Text>
            </View>
            <View style={styles.organizerInfo}>
              <Text style={styles.organizerName}>{event.organizadorNombre}</Text>
              <View style={styles.organizerMeta}>
                <Text style={styles.organizerMetaText}>Organizador verificado · </Text>
                <Ionicons name="star" size={10} color={COLORS.star} />
                <Text style={styles.organizerMetaScore}>
                  {event.organizadorPuntaje ? event.organizadorPuntaje.toFixed(1) : '5.0'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </View>

          {/* Sección de Entradas */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Entradas disponibles</Text>
          </View>

          {event.tiposEntrada && event.tiposEntrada.map((tipo) => (
            <TicketTypeCard
              key={tipo.id}
              tipo={tipo}
              mode="select"
              onSelect={() =>
                navigation.navigate('TicketSelection', {
                  eventId: event.id,
                  selectedTicketId: tipo.id,
                })
              }
            />
          ))}

          {/* Sección de Reseñas de este Evento */}
          <View style={[styles.sectionHeader, { marginTop: SPACING.xl }]}>
            <Text style={styles.sectionTitle}>Reseñas de este evento</Text>
            <Text style={styles.reviewCount}>({reviews.length})</Text>
          </View>

          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{rev.compradorNombre}</Text>
                  <RatingStars rating={rev.puntuacion} size={14} />
                </View>
                <Text style={styles.reviewComment}>“{rev.detalle}”</Text>
              </View>
            ))
          ) : (
            <View style={styles.noReviewsBox}>
              <Text style={styles.noReviewsText}>
                Aún no hay reseñas registradas para este evento.
              </Text>
            </View>
          )}

          {/* Sección de Reseñas de Eventos Anteriores del Organizador */}
          <View style={[styles.sectionHeader, { marginTop: SPACING.xl }]}>
            <View style={{ flex: 1, paddingRight: SPACING.sm }}>
              <Text style={styles.sectionTitle}>
                Reseñas de eventos anteriores del organizador
              </Text>
              <Text style={styles.sectionSubtitle}>
                Experiencias de asistentes en producciones de {event.organizadorNombre || 'la productora'}
              </Text>
            </View>
            <Text style={styles.reviewCount}>({organizerReviews.length})</Text>
          </View>

          {organizerReviews.length > 0 ? (
            organizerReviews.map((rev) => (
              <View key={rev.id} style={styles.previousReviewCard}>
                <View style={styles.prevEventHeader}>
                  <View style={styles.prevEventBadge}>
                    <Ionicons name="musical-notes-outline" size={13} color={COLORS.primary} />
                    <Text style={styles.prevEventTitle} numberOfLines={1}>
                      {rev.eventoNombre || 'Evento anterior'}
                    </Text>
                  </View>
                  <View style={styles.starsRow}>
                    <RatingStars rating={rev.puntuacion} size={13} />
                    <Text style={styles.prevRatingScore}>({rev.puntuacion}.0)</Text>
                  </View>
                </View>

                <View style={styles.prevReviewerRow}>
                  <Ionicons name="person-circle-outline" size={15} color={COLORS.textSecondary} />
                  <Text style={styles.prevReviewerName}>
                    {rev.compradorNombre || 'Asistente verificado'}
                  </Text>
                </View>

                {rev.detalle ? (
                  <Text style={styles.reviewComment}>“{rev.detalle}”</Text>
                ) : null}
              </View>
            ))
          ) : (
            <View style={styles.noReviewsBox}>
              <Text style={styles.noReviewsText}>
                No hay reseñas registradas de eventos anteriores de este organizador.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Barra Inferior Fija de Compra */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || SPACING.md }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Precio desde</Text>
          <Text style={styles.bottomPriceValue}>{formattedMinPrice}</Text>
        </View>

        <PrimaryButton
          title="Comprar entradas"
          onPress={() =>
            navigation.navigate('TicketSelection', {
              eventId: event.id,
            })
          }
          style={styles.buyButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  heroContainer: {
    height: 240,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.backgroundSecondary,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  heroCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(248, 247, 244, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  body: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  categoryBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.round,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingNumber: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
    marginVertical: SPACING.xs,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
    marginVertical: SPACING.sm,
  },
  infoCardsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  infoSubtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.subtle,
  },
  organizerAvatar: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  organizerInitials: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  organizerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  organizerMetaText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  organizerMetaScore: {
    fontSize: 10,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginLeft: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  previousReviewCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(70, 113, 122, 0.25)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.subtle,
  },
  prevEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  prevEventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    maxWidth: '65%',
  },
  prevEventTitle: {
    fontSize: 11,
    fontWeight: FONTS.semiBold,
    color: COLORS.primary,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prevRatingScore: {
    fontSize: 11,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  prevReviewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  prevReviewerName: {
    fontSize: 11,
    fontWeight: FONTS.medium,
    color: COLORS.textSecondary,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 12,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  reviewComment: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  reviewDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'right',
  },
  noReviewsBox: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  noReviewsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    ...SHADOWS.card,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  bottomPriceValue: {
    fontSize: 17,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  buyButton: {
    paddingHorizontal: SPACING.xl,
  },
});
