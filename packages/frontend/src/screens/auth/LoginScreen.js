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
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme.js';

export const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login } = useApp();

  const [selectedRole, setSelectedRole] = useState('Comprador'); // 'Comprador' | 'Organizador'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canGoBack = navigation.canGoBack();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Datos incompletos', 'Por favor ingresá tu email y contraseña.');
      return;
    }

    setSubmitting(true);
    try {
      await login({
        email: email.trim(),
        password,
        rolSolicitado: selectedRole,
      });
      try {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } catch {
        // Redirección manejada automáticamente por el RootNavigator condicional
      }
    } catch (err) {
      Alert.alert('Error al iniciar sesión', err.message || 'Verificá tus credenciales.');
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
        title="Ingresar a AI Ticket It"
        showBack={canGoBack}
        onBack={() => canGoBack && navigation.goBack()}
        showNotificationBell={false}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + SPACING.xxxl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Selector de Rol */}
        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[
              styles.roleOption,
              selectedRole === 'Comprador' && styles.roleOptionActive,
            ]}
            onPress={() => setSelectedRole('Comprador')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="person"
              size={16}
              color={selectedRole === 'Comprador' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.roleOptionText,
                selectedRole === 'Comprador' && styles.roleOptionTextActive,
              ]}
            >
              Comprador
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleOption,
              selectedRole === 'Organizador' && styles.roleOptionActive,
            ]}
            onPress={() => setSelectedRole('Organizador')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="briefcase"
              size={16}
              color={selectedRole === 'Organizador' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.roleOptionText,
                selectedRole === 'Organizador' && styles.roleOptionTextActive,
              ]}
            >
              Organizador
            </Text>
          </TouchableOpacity>
        </View>

        {/* Formulario */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {selectedRole === 'Comprador' ? 'Acceso Compradores' : 'Acceso Productoras'}
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder={
              selectedRole === 'Comprador'
                ? 'martina.garcia@example.com'
                : 'contacto@lunaproducciones.com'
            }
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={submitting}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Iniciando...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Links de Registro */}
        <View style={styles.registerLinks}>
          <TouchableOpacity
            onPress={() => navigation.navigate('RegisterBuyer')}
            activeOpacity={0.7}
            style={styles.registerLink}
          >
            <Text style={styles.registerLinkText}>
              ¿No tenés cuenta de comprador? <Text style={styles.boldText}>Registrate acá</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('RegisterOrganizer')}
            activeOpacity={0.7}
            style={styles.registerLink}
          >
            <Text style={styles.registerLinkText}>
              ¿Sos productora o promotor? <Text style={styles.boldText}>Registrá tu empresa</Text>
            </Text>
          </TouchableOpacity>
        </View>
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
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.lg,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  roleOptionActive: {
    backgroundColor: COLORS.primary,
  },
  roleOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  roleOptionTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
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
    marginTop: SPACING.xs,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  demoCard: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#ECE4D4',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accentAmber,
  },
  demoSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  demoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  demoButtonContent: {
    flex: 1,
  },
  demoButtonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  demoButtonRole: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  registerLinks: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  registerLink: {
    paddingVertical: SPACING.xs,
  },
  registerLinkText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.primary,
  },
});
