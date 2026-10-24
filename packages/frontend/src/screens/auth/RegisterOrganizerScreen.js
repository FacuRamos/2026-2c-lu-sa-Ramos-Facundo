import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme.js';

export const RegisterOrganizerScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { registerOrganizer } = useApp();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [nombreProductora, setNombreProductora] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (
      !nombre.trim() ||
      !apellido.trim() ||
      !nombreProductora.trim() ||
      !email.trim() ||
      !password
    ) {
      Alert.alert('Campos incompletos', 'Por favor completá todos los campos obligatorios (*).');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      await registerOrganizer({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        nombreProductora: nombreProductora.trim(),
        razonSocial: razonSocial.trim() || undefined,
        email: email.trim(),
        password,
      });
      Alert.alert(
        '¡Productora Registrada!',
        `Bienvenido ${nombreProductora}. Ya podés crear tus eventos y gestionar tus ventas.`,
        [
          {
            text: 'Ir a mi Panel',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error al registrar productora', err.message || 'No se pudo completar el registro.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScreenHeader
        title="Registrar Productora"
        showBack
        onBack={() => navigation.goBack()}
        showNotificationBell={false}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + SPACING.xxxl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.cardSubtitle}>
            Publicá tus espectáculos, administrá el stock de tipos de entrada y comunicate directamente con tus asistentes.
          </Text>

          <Text style={styles.label}>Nombre de la Productora / Marca *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Luna Producciones o Indie Live"
            placeholderTextColor={COLORS.textMuted}
            value={nombreProductora}
            onChangeText={setNombreProductora}
          />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Nombre Responsable *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Luna"
                placeholderTextColor={COLORS.textMuted}
                value={nombre}
                onChangeText={setNombre}
              />
            </View>

            <View style={styles.flex1}>
              <Text style={styles.label}>Apellido Responsable *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Producciones"
                placeholderTextColor={COLORS.textMuted}
                value={apellido}
                onChangeText={setApellido}
              />
            </View>
          </View>

          <Text style={styles.label}>Razón Social o Fantasía (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Luna Live S.R.L."
            placeholderTextColor={COLORS.textMuted}
            value={razonSocial}
            onChangeText={setRazonSocial}
          />

          <Text style={styles.label}>Email Comercial *</Text>
          <TextInput
            style={styles.input}
            placeholder="contacto@productora.com"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña * (mínimo 6 caracteres)</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirmar Contraseña *</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textMuted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleRegister}
            disabled={submitting}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Registrando...' : 'Registrar Productora'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.loginLink}
          activeOpacity={0.7}
        >
          <Text style={styles.loginLinkText}>
            ¿Ya tenés cuenta? <Text style={styles.boldText}>Iniciá sesión</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.lg,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  flex1: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  loginLinkText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
});
