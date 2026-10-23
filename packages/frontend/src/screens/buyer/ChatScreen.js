import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS, RADIUS } from '../../constants/theme.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { ChatMessage } from '../../components/chat/ChatMessage.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { useChat } from '../../hooks/useChat.js';

export const ChatScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { purchaseId, title } = route.params || {};

  const {
    currentUser,
    purchase,
    messages,
    inputText,
    setInputText,
    sending,
    loading,
    handleSend,
    scrollViewRef,
  } = useChat(purchaseId);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleShowOptions = useCallback(() => {
    if (!purchase) return;
    Alert.alert(
      'Opciones del chat',
      `Conversación sobre la compra de ${purchase.cantidad} entradas para ${purchase.eventoTitulo}.`
    );
  }, [purchase]);

  if (loading || !purchase) {
    return <LoadingSpinner fullScreen message="Cargando chat..." />;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScreenHeader
        title={title || purchase.eventoTitulo}
        subtitle={`Compra #${purchase.id}`}
        showBack
        onBack={handleBack}
        rightAction={
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={handleShowOptions}
            accessibilityLabel="Opciones del chat"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
      >
        <View style={styles.dateBadgeContainer}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>Hoy</Text>
          </View>
        </View>

        {messages.length > 0 ? (
          messages.map((msg) => {
            const isOwn = msg.remitenteId === currentUser?.id;
            return (
              <ChatMessage
                key={msg.id}
                message={msg}
                isOwnMessage={isOwn}
              />
            );
          })
        ) : (
          <View style={styles.emptyChatBox}>
            <Text style={styles.emptyChatText}>
              Iniciá la conversación con el organizador sobre horarios, accesos o dudas.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input de Mensaje */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom || SPACING.md }]}>
        <TextInput
          style={styles.textInput}
          placeholder="Escribí un mensaje..."
          placeholderTextColor={COLORS.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
          style={[
            styles.sendButton,
            (!inputText.trim() || sending) && styles.sendButtonDisabled,
          ]}
          accessibilityLabel="Enviar mensaje"
        >
          <Ionicons name="send" size={16} color={COLORS.surface} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  moreBtn: {
    padding: SPACING.xs,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  dateBadgeContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dateBadge: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
  },
  dateBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.semiBold,
    color: COLORS.textSecondary,
  },
  emptyChatBox: {
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.xxxl,
  },
  emptyChatText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.backgroundSecondary,
    opacity: 0.6,
  },
});
