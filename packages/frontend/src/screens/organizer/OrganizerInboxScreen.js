import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext.js';
import { apiService } from '../../services/apiService.js';
import { COLORS, SPACING, FONTS, RADIUS, SHADOWS } from '../../constants/theme.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { EmptyState } from '../../components/common/EmptyState.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const OrganizerInboxScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { currentUser, purchases } = useApp();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConversations() {
      if (!currentUser?.id) {
        setConversations([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const convs = await apiService.getConversacionesOrganizador(currentUser.id);
        setConversations(convs);
      } catch (err) {
        Alert.alert('Error', err.message || 'No se pudieron cargar las conversaciones');
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, [currentUser?.id, purchases]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Cargando mensajes..." />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Chat organizador"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.inboxTitle}>Mensajes de compradores</Text>
        <Text style={styles.inboxSubtitle}>
          Respondé dudas sobre horarios, accesos o cambios de entradas.
        </Text>

        {conversations.length > 0 ? (
          conversations.map((conv) => {
            const hasMessages = conv.ultimoMensaje != null;
            return (
              <TouchableOpacity
                key={conv.compraId}
                style={styles.convCard}
                onPress={() =>
                  navigation.navigate('Chat', {
                    purchaseId: conv.compraId,
                    title: `Chat con ${conv.compradorNombre}`,
                  })
                }
                activeOpacity={0.8}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {conv.compradorNombre ? conv.compradorNombre[0].toUpperCase() : 'C'}
                  </Text>
                </View>

                <View style={styles.convContent}>
                  <View style={styles.topRow}>
                    <Text style={styles.buyerName} numberOfLines={1}>
                      {conv.compradorNombre}
                    </Text>
                    {hasMessages ? (
                      <Text style={styles.timeText}>{conv.ultimoMensaje.fecha}</Text>
                    ) : null}
                  </View>

                  <Text style={styles.eventTitle} numberOfLines={1}>
                    {conv.eventoTitulo} · {conv.tipoEntradaNombre}
                  </Text>

                  <Text
                    style={[
                      styles.lastMessage,
                      !hasMessages && styles.noMessageText,
                    ]}
                    numberOfLines={1}
                  >
                    {hasMessages
                      ? `${conv.ultimoMensaje.esComprador ? '' : 'Vos: '}${conv.ultimoMensaje.texto}`
                      : 'Sin mensajes aún. Tocá para iniciar conversación.'}
                  </Text>
                </View>

                {conv.totalMessages > 0 ? (
                  <View style={styles.badgeCount}>
                    <Text style={styles.badgeText}>{conv.totalMessages}</Text>
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <EmptyState
            icon="chatbubbles-outline"
            title="Bandeja de mensajes vacía"
            message="No hay consultas de compradores para tus eventos en este momento."
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
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xxxl,
  },
  inboxTitle: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  inboxSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.lg,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.subtle,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
  convContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buyerName: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  timeText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  eventTitle: {
    fontSize: 11,
    fontWeight: FONTS.semiBold,
    color: COLORS.primary,
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  noMessageText: {
    fontStyle: 'italic',
    color: COLORS.textMuted,
  },
  badgeCount: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.round,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: FONTS.bold,
    color: COLORS.surface,
  },
});
