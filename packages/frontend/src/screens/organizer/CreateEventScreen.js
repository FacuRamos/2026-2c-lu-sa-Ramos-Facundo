import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext.js';
import { COLORS, SPACING, FONTS, RADIUS, SHADOWS } from '../../constants/theme.js';
import { ScreenHeader } from '../../components/common/ScreenHeader.js';
import { FormInput } from '../../components/common/FormInput.js';
import { PrimaryButton } from '../../components/common/PrimaryButton.js';

let RNDateTimePicker = null;
if (Platform.OS !== 'web') {
  try {
    const mod = require('@react-native-community/datetimepicker');
    RNDateTimePicker = mod.default || mod;
  } catch {
    RNDateTimePicker = null;
  }
}

const PRESET_IMAGES = [
  { label: 'Concierto', url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85' },
  { label: 'Teatro', url: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=85' },
  { label: 'Deporte', url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=85' },
  { label: 'Festival', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=85' },
];

function parseFechaYHora(fechaStr, horaStr) {
  if (!fechaStr || !fechaStr.trim()) return null;
  const horaLimpia = (horaStr || '21:00').trim();

  let anio, mes, dia;
  if (fechaStr.includes('/')) {
    const partes = fechaStr.trim().split('/');
    if (partes.length !== 3) return null;
    dia = parseInt(partes[0], 10);
    mes = parseInt(partes[1], 10) - 1;
    anio = parseInt(partes[2], 10);
  } else if (fechaStr.includes('-')) {
    const partes = fechaStr.trim().split('-');
    if (partes.length !== 3) return null;
    if (partes[0].length === 4) {
      anio = parseInt(partes[0], 10);
      mes = parseInt(partes[1], 10) - 1;
      dia = parseInt(partes[2], 10);
    } else {
      dia = parseInt(partes[0], 10);
      mes = parseInt(partes[1], 10) - 1;
      anio = parseInt(partes[2], 10);
    }
  } else {
    return null;
  }

  let horas = 21;
  let minutos = 0;
  if (horaLimpia.includes(':')) {
    const partesHora = horaLimpia.split(':');
    horas = parseInt(partesHora[0], 10);
    minutos = parseInt(partesHora[1], 10);
  }

  if (isNaN(dia) || isNaN(mes) || isNaN(anio) || isNaN(horas) || isNaN(minutos)) {
    return null;
  }

  const targetDate = new Date(anio, mes, dia, horas, minutos, 0, 0);
  if (isNaN(targetDate.getTime())) return null;
  return targetDate;
}

export const CreateEventScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { categories, createEvent } = useApp();

  // Fecha por defecto: 14 días en el futuro a las 21:00 hs
  const today = new Date();
  const defaultFutureDate = new Date(today);
  defaultFutureDate.setDate(today.getDate() + 14);
  defaultFutureDate.setHours(21, 0, 0, 0);

  const defDia = String(defaultFutureDate.getDate()).padStart(2, '0');
  const defMes = String(defaultFutureDate.getMonth() + 1).padStart(2, '0');
  const defAnio = defaultFutureDate.getFullYear();

  const [dateObj, setDateObj] = useState(defaultFutureDate);
  const [fecha, setFecha] = useState(`${defDia}/${defMes}/${defAnio}`);
  const [fechaWeb, setFechaWeb] = useState(`${defAnio}-${defMes}-${defDia}`);
  const [hora, setHora] = useState('21:00');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [nombre, setNombre] = useState('Luna Park Sessions');
  const [descripcion, setDescripcion] = useState('Una noche única con artistas emergentes y consagrados de la escena independiente.');
  const [categoriaId, setCategoriaId] = useState('cat-musica');
  const [ubicacion, setUbicacion] = useState('Luna Park, CABA');
  const [imagen, setImagen] = useState(PRESET_IMAGES[0].url);

  const [tiposEntrada, setTiposEntrada] = useState([
    { id: '1', nombre: 'General', precio: '18500', cupo: '500' },
    { id: '2', nombre: 'Platea', precio: '28000', cupo: '200' },
    { id: '3', nombre: 'VIP', precio: '42000', cupo: '50' },
  ]);

  const [submitting, setSubmitting] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDateObj(selectedDate);
      const dia = String(selectedDate.getDate()).padStart(2, '0');
      const mes = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const anio = selectedDate.getFullYear();
      setFecha(`${dia}/${mes}/${anio}`);
      setFechaWeb(`${anio}-${mes}-${dia}`);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      const horas = String(selectedTime.getHours()).padStart(2, '0');
      const minutos = String(selectedTime.getMinutes()).padStart(2, '0');
      setHora(`${horas}:${minutos}`);
    }
  };

  // Manejo de Tipos de Entrada
  const handleAddTipo = () => {
    setTiposEntrada((prev) => [
      ...prev,
      { id: String(Date.now()), nombre: '', precio: '', cupo: '' },
    ]);
  };

  const handleRemoveTipo = (id) => {
    if (tiposEntrada.length <= 1) {
      Alert.alert('Atención', 'El evento debe tener al menos un tipo de entrada.');
      return;
    }
    setTiposEntrada((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateTipo = (id, field, value) => {
    setTiposEntrada((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handlePublish = async () => {
    // Validaciones
    if (!nombre.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresá el nombre del evento.');
      return;
    }
    if (!descripcion.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresá una descripción del evento.');
      return;
    }
    if (!ubicacion.trim()) {
      Alert.alert('Campo requerido', 'Por favor indicá la ubicación o lugar del evento.');
      return;
    }

    // Validar fecha y hora
    const targetDate = parseFechaYHora(fecha, hora);
    if (!targetDate) {
      Alert.alert('Fecha u hora inválida', 'Por favor ingresá una fecha válida en formato DD/MM/AAAA (ej: 24/08/2026) y hora en formato HH:mm (ej: 21:00).');
      return;
    }

    if (targetDate.getTime() <= Date.now()) {
      Alert.alert(
        'Fecha no permitida',
        'No podés crear un evento en una fecha u hora que ya pasó. Por favor ingresá una fecha futura.'
      );
      return;
    }

    // Validar tipos de entrada
    for (const t of tiposEntrada) {
      if (!t.nombre.trim()) {
        Alert.alert('Tipo de entrada inválido', 'Todos los tipos de entrada deben tener un nombre.');
        return;
      }
      if (isNaN(Number(t.precio)) || Number(t.precio) <= 0) {
        Alert.alert('Precio inválido', `El precio de "${t.nombre || 'entrada'}" debe ser mayor a 0.`);
        return;
      }
      if (isNaN(Number(t.cupo)) || Number(t.cupo) <= 0) {
        Alert.alert('Cupo inválido', `El cupo de "${t.nombre || 'entrada'}" debe ser mayor a 0.`);
        return;
      }
    }

    try {
      setSubmitting(true);
      const nuevo = await createEvent({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        categoriaId,
        fecha: targetDate.toISOString(),
        fechaTexto: `${fecha.trim()} · ${hora.trim()} hs`,
        ubicacion: ubicacion.trim(),
        direccion: `${ubicacion.trim()}, CABA`,
        imagen,
        tiposEntrada: tiposEntrada.map((t) => ({
          nombre: t.nombre.trim(),
          precio: Number(t.precio),
          cupo: Number(t.cupo),
        })),
      });

      if (Platform.OS === 'web') {
        if (nuevo?.id) {
          navigation.replace('ManageEvent', { eventId: nuevo.id });
        } else {
          navigation.goBack();
        }
        return;
      }

      Alert.alert(
        '¡Evento publicado!',
        `El evento "${nuevo.nombre}" ya se encuentra publicado y disponible para la venta.`,
        [
          {
            text: 'Ver gestión del evento',
            onPress: () => {
              if (nuevo?.id) {
                navigation.replace('ManageEvent', { eventId: nuevo.id });
              } else {
                navigation.goBack();
              }
            },
          },
        ],
        {
          cancelable: false,
        }
      );
    } catch (err) {
      Alert.alert('Error al publicar', err.message || 'No se pudo crear el evento.');
    } finally {
      setSubmitting(false);
    }
  };

  const availableCategories = categories.filter((c) => c.id !== 'all');

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScreenHeader
        title="Crear evento"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <View style={styles.draftBadge}>
            <Text style={styles.draftText}>Borrador</Text>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 280 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <FormInput
          label="Nombre del evento"
          placeholder="Ej: Luna Park Sessions 2026"
          value={nombre}
          onChangeText={setNombre}
        />

        <FormInput
          label="Descripción"
          placeholder="Describí los artistas, temática y experiencia..."
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={3}
        />

        {/* Categoría Selector */}
        <Text style={styles.fieldLabel}>Categoría</Text>
        <View style={styles.categoryPills}>
          {availableCategories.map((c) => {
            const isSelected = categoriaId === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => setCategoriaId(c.id)}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillSelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextSelected,
                  ]}
                >
                  {c.nombre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Fecha y Hora con Selector Dinámico */}
        {Platform.OS === 'web' ? (
          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.fieldLabel}>Fecha</Text>
              <input
                type="date"
                min={`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`}
                value={fechaWeb}
                onChange={(e) => {
                  const val = e.target.value;
                  setFechaWeb(val);
                  if (val) {
                    const [y, m, d] = val.split('-');
                    setFecha(`${d}/${m}/${y}`);
                    setDateObj(new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10)));
                  }
                }}
                style={{
                  backgroundColor: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: RADIUS.md,
                  padding: '11px 12px',
                  fontSize: 14,
                  color: COLORS.textPrimary,
                  fontFamily: 'inherit',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  marginBottom: SPACING.md,
                }}
              />
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.fieldLabel}>Hora</Text>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                style={{
                  backgroundColor: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: RADIUS.md,
                  padding: '11px 12px',
                  fontSize: 14,
                  color: COLORS.textPrimary,
                  fontFamily: 'inherit',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  marginBottom: SPACING.md,
                }}
              />
            </View>
          </View>
        ) : (
          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.fieldLabel}>Fecha</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                <Text style={styles.pickerButtonText}>{fecha || 'DD/MM/AAAA'}</Text>
                <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.fieldLabel}>Hora</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                <Text style={styles.pickerButtonText}>{hora ? `${hora} hs` : 'HH:mm'}</Text>
                <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Chips de sugerencia rápida de horarios */}
        <View style={styles.quickTimeRow}>
          <Text style={styles.quickTimeLabel}>Horas sugeridas:</Text>
          {['19:00', '20:00', '21:00', '22:00', '23:00'].map((preset) => (
            <TouchableOpacity
              key={preset}
              onPress={() => setHora(preset)}
              style={[
                styles.quickTimeChip,
                hora === preset && styles.quickTimeChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.quickTimeChipText,
                  hora === preset && styles.quickTimeChipTextSelected,
                ]}
              >
                {preset}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FormInput
          label="Ubicación"
          placeholder="Ej: Luna Park, CABA"
          value={ubicacion}
          onChangeText={setUbicacion}
        />

        {/* Preset de Imágenes */}
        <Text style={styles.fieldLabel}>Imagen destacada</Text>
        <View style={styles.presetRow}>
          {PRESET_IMAGES.map((preset) => {
            const isSelected = imagen === preset.url;
            return (
              <TouchableOpacity
                key={preset.label}
                onPress={() => setImagen(preset.url)}
                style={[
                  styles.presetBtn,
                  isSelected && styles.presetBtnSelected,
                ]}
              >
                <Text
                  style={[
                    styles.presetBtnText,
                    isSelected && styles.presetBtnTextSelected,
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sección Tipos de Entrada */}
        <View style={styles.ticketsSectionHeader}>
          <Text style={styles.ticketsSectionTitle}>Tipos de entrada</Text>
          <TouchableOpacity onPress={handleAddTipo} style={styles.addTipoBtn}>
            <Ionicons name="add" size={14} color={COLORS.primary} />
            <Text style={styles.addTipoText}>Agregar tipo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ticketGridHeader}>
          <Text style={[styles.ticketHeaderCol, { flex: 2 }]}>Nombre</Text>
          <Text style={[styles.ticketHeaderCol, { flex: 1.2 }]}>Precio ($)</Text>
          <Text style={[styles.ticketHeaderCol, { flex: 1 }]}>Cupo</Text>
          <View style={{ width: 28 }} />
        </View>

        {tiposEntrada.map((t) => (
          <View key={t.id} style={styles.ticketRow}>
            <FormInput
              placeholder="General"
              value={t.nombre}
              onChangeText={(v) => handleUpdateTipo(t.id, 'nombre', v)}
              style={[styles.ticketInputContainer, { flex: 2 }]}
              inputStyle={styles.ticketInput}
            />
            <FormInput
              placeholder="15000"
              value={t.precio}
              onChangeText={(v) => handleUpdateTipo(t.id, 'precio', v)}
              keyboardType="numeric"
              style={[styles.ticketInputContainer, { flex: 1.2 }]}
              inputStyle={styles.ticketInput}
            />
            <FormInput
              placeholder="100"
              value={t.cupo}
              onChangeText={(v) => handleUpdateTipo(t.id, 'cupo', v)}
              keyboardType="numeric"
              style={[styles.ticketInputContainer, { flex: 1 }]}
              inputStyle={styles.ticketInput}
            />
            {tiposEntrada.length > 1 ? (
              <TouchableOpacity
                onPress={() => handleRemoveTipo(t.id)}
                style={styles.deleteTicketBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={16} color={COLORS.accentRed} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 28 }} />
            )}
          </View>
        ))}

        {/* Botón de Publicación */}
        <PrimaryButton
          title="Publicar evento"
          onPress={handlePublish}
          loading={submitting}
          style={styles.publishBtn}
        />
      </ScrollView>

      {/* Modales DateTimePicker para iOS */}
      {Platform.OS === 'ios' && showDatePicker && (
        <Modal transparent animationType="fade" visible={showDatePicker}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          >
            <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Elegir fecha del evento</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Ionicons name="close" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
              {RNDateTimePicker ? (
                <RNDateTimePicker
                  value={dateObj}
                  mode="date"
                  display="inline"
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                  textColor={COLORS.textPrimary}
                  accentColor={COLORS.primary}
                />
              ) : null}
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalConfirmText}>Listo</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {Platform.OS === 'ios' && showTimePicker && (
        <Modal transparent animationType="fade" visible={showTimePicker}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTimePicker(false)}
          >
            <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Elegir hora de inicio</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Ionicons name="close" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
              {RNDateTimePicker ? (
                <RNDateTimePicker
                  value={(() => {
                    const d = new Date(dateObj);
                    const [h, m] = (hora || '21:00').split(':');
                    d.setHours(parseInt(h || '21', 10), parseInt(m || '0', 10));
                    return d;
                  })()}
                  mode="time"
                  display="spinner"
                  is24Hour={true}
                  onChange={handleTimeChange}
                  textColor={COLORS.textPrimary}
                />
              ) : null}
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.modalConfirmText}>Listo</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Pickers nativos para Android */}
      {Platform.OS === 'android' && showDatePicker && RNDateTimePicker && (
        <RNDateTimePicker
          value={dateObj}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}
      {Platform.OS === 'android' && showTimePicker && RNDateTimePicker && (
        <RNDateTimePicker
          value={(() => {
            const d = new Date(dateObj);
            const [h, m] = (hora || '21:00').split(':');
            d.setHours(parseInt(h || '21', 10), parseInt(m || '0', 10));
            return d;
          })()}
          mode="time"
          display="default"
          is24Hour={true}
          onChange={handleTimeChange}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  draftBadge: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.round,
  },
  draftText: {
    fontSize: 10,
    fontWeight: FONTS.semiBold,
    color: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxxl,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs + 2,
  },
  categoryPills: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  categoryPill: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.round,
  },
  categoryPillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryPillText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  categoryPillTextSelected: {
    color: COLORS.surface,
    fontWeight: FONTS.bold,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfCol: {
    flex: 1,
  },
  presetRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.xs + 2,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  presetBtnSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  presetBtnText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  presetBtnTextSelected: {
    color: COLORS.primary,
    fontWeight: FONTS.bold,
  },
  ticketsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  ticketsSectionTitle: {
    fontSize: 13,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  addTipoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  addTipoText: {
    fontSize: 11,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
  },
  ticketGridHeader: {
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  ticketHeaderCol: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 2,
  },
  ticketInputContainer: {
    marginBottom: SPACING.xs,
  },
  ticketInput: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    fontSize: 12,
  },
  deleteTicketBtn: {
    width: 28,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishBtn: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  pickerButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md - 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  pickerButtonText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: FONTS.medium,
  },
  quickTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: -SPACING.xs,
    marginBottom: SPACING.md,
  },
  quickTimeLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginRight: 2,
  },
  quickTimeChip: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.round,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickTimeChipSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  quickTimeChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  quickTimeChipTextSelected: {
    color: COLORS.primary,
    fontWeight: FONTS.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 360,
    ...SHADOWS.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  modalConfirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  modalConfirmText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: FONTS.bold,
  },
});
