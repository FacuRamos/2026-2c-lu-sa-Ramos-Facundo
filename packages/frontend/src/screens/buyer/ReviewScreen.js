import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext.js';
import { apiService } from '../../services/apiService.js';
import { COLORS, SPACING, FONTS, RADIUS, SHADOWS } from '../../constants/theme.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { RatingStars } from '../../components/common/RatingStars.js';
import { FormInput } from '../../components/common/FormInput.js';
import { PrimaryButton } from '../../components/common/PrimaryButton.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const ReviewScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { eventId, eventTitle, eventImage, purchaseId } = route.params || {};
  const { createReview, purchases } = useApp();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existingReviews, setExistingReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Validar si el usuario tiene una compra UTILIZADA para este evento
  const hasUsedPurchase = purchases.some(
    (p) => p.eventoId === eventId && p.estado === 'UTILIZADA'
  );

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        const revs = await apiService.getReseniasByEvento(eventId);
        setExistingReviews(revs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      loadReviews();
    }
  }, [eventId]);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Atención', 'Por favor escribí un comentario sobre tu experiencia.');
      return;
    }

    if (!hasUsedPurchase) {
      Alert.alert(
        'Acceso restringido',
        'Solo podés calificar un evento cuando tu entrada haya sido utilizada.'
      );
      return;
    }

    try {
      setSubmitting(true);
      await createReview({
        eventoId,
        puntuacion: rating,
        detalle: comment.trim(),
      });

      Alert.alert(
        '¡Reseña publicada!',
        'Muchas gracias por compartir tu experiencia con la comunidad.',
        [
          {
            text: 'Aceptar',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo publicar la reseña.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Cargando reseñas..." />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Calificar evento"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner de evento */}
        {eventImage ? (
          <Image source={{ uri: eventImage }} style={styles.eventImage} resizeMode="cover" />
        ) : null}

        <View style={styles.reviewCard}>
          <Text style={styles.eventTitle}>{eventTitle || 'Calificar evento'}</Text>
          <Text style={styles.subtitle}>Tu opinión ayuda a otros asistentes</Text>

          {/* Selector de Estrellas */}
          <View style={styles.starsWrapper}>
            <RatingStars
              rating={rating}
              size={32}
              interactive
              onRatingChange={setRating}
            />
          </View>

          {/* Formulario de Comentario */}
          <FormInput
            label="Tu experiencia"
            placeholder="Contá cómo fue tu experiencia..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            editable={hasUsedPurchase}
            helperText={
              !hasUsedPurchase
                ? 'Para calificar este evento, tu entrada debe figurar como Utilizada.'
                : 'Compartí detalles sobre el sonido, organización y ambiente.'
            }
          />

          <PrimaryButton
            title="Publicar reseña"
            onPress={handleSubmit}
            loading={submitting}
            disabled={!hasUsedPurchase || submitting || !comment.trim()}
            style={styles.submitBtn}
          />
        </View>

        {/* Reseñas existentes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reseñas existentes</Text>
        </View>

        {existingReviews.length > 0 ? (
          existingReviews.map((rev) => (
            <View key={rev.id} style={styles.existingCard}>
              <View style={styles.existingHeader}>
                <Text style={styles.existingAuthor}>{rev.compradorNombre}</Text>
                <RatingStars rating={rev.puntuacion} size={14} />
              </View>
              <Text style={styles.existingComment}>“{rev.detalle}”</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noReviews}>Sé el primero en compartir una reseña.</Text>
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
    paddingBottom: SPACING.xxxl,
  },
  eventImage: {
    height: 140,
    width: '100%',
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.subtle,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  starsWrapper: {
    marginVertical: SPACING.md,
  },
  submitBtn: {
    width: '100%',
    marginTop: SPACING.sm,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  existingCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  existingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  existingAuthor: {
    fontSize: 12,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  existingComment: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  noReviews: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    paddingVertical: SPACING.sm,
  },
});
