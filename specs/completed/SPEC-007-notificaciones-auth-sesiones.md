# [SPEC-007] Centro de Notificaciones, Autenticación Simplificada y ADR de Manejo de Sesiones

> **Metodología:** Spec-Driven Development (SDD) - Cátedra de Diseño y Desarrollo de Software (UTN)  
> **Estado:** Completado y Aprobado  
> **Dependencias:** SPEC-001 a SPEC-006 (Completadas y Aprobadas)

---

## 1. Intención
Formalizar la especificación técnica, el modelo de dominio y la decisión arquitectónica (ADR) para incorporar tres subsistemas esenciales en la plataforma **AI Ticket It**:
1. **Centro de Notificaciones en Tiempo Real (Campanita):** Proveer a compradores y organizadores visibilidad inmediata de eventos críticos mediante una campanita interactiva en `ScreenHeader` con badge dinámico de no leídas, notificaciones demo precargadas y pantalla dedicada `NotificationScreen`.
2. **Autenticación y Registro Diferenciado Simplificado:**
   - **Comprador:** Nombre, Apellido, Email y Contraseña (sin teléfono obligatorio).
   - **Organizador (`Organizador extends Usuario`):** Nombre, Apellido, Email, Contraseña y **Nombre de la Productora** (sin CBU, sin Alias y sin CUIT rígido). Vinculación transparente de eventos al organizador mediante `organizadorId`.
   - **Acceso Rápido Demo:** Botones de un toque en pantalla de login para ingresar instantáneamente como *Martina (Comprador)* o *Luna Producciones (Organizador)* sin fricción.
3. **Manejo Seguro de Sesiones en Aplicaciones Móviles Desacopladas (ADR):** Implementación de JWT (Access Token + Refresh Token) respaldados en hardware móvil con `expo-secure-store` (iOS Keychain / Android KeyStore).

---

## 2. Análisis Arquitectónico y Matriz Comparativa (ADR de Sesiones)

### 2.1. Matriz Comparativa de Estrategias de Sesión

| Criterio de Evaluación | Opción A: OAuth 2.0 (Social Sign-In) | Opción B: Cookies HttpOnly / SameSite | Opción C: JWT + Hardware Keystore (`expo-secure-store`) [RECOMENDADA] |
| :--- | :--- | :--- | :--- |
| **Experiencia de Usuario** | Login social en un toque. | Transparente en navegador web. | Excelente: login persistente, renovación en segundo plano y botones Demo rápidos. |
| **Captura de Datos de Negocio** | ❌ No entrega nombre de productora. | ⚠️ Requiere formularios propios igualmente. | ✅ Datos directos validados con esquemas Zod en backend. |
| **Compatibilidad Móvil Nativa** | ⚠️ Requiere cuentas y certificados de Apple/Google. | ❌ Frágil en clientes nativos (`NSURLSession`/`OkHttp`); problemas de dominios en LAN y túneles. | ✅ Universal: cabecera estándar `Authorization: Bearer <token>`, inmune a bloqueos de cookies. |
| **Seguridad en Reposo (At Rest)** | Depende del token almacenado. | Depende del sandbox del WebView. | ✅ Máxima Seguridad: hardware dedicado (iOS Keychain / Android KeyStore con cifrado AES-256). |
| **Escalabilidad del Backend** | Dependencia externa. | Stateful (requiere store de sesión en memoria/Redis). | ✅ Stateless: verificación criptográfica local sin consultar bases de datos en cada request. |
| **Viabilidad Académica (UTN)** | ⚠️ Difícil de evaluar y corregir sin cuentas pagas. | ⚠️ Frecuentes fallos de red al conectar el celular del alumno a la PC del evaluador. | ✅ 100% Viable, Auditable y Estándar de la industria. |

> **Veredicto Oficial:** Adopción de la **Opción C (JWT + `expo-secure-store`)** con Acceso Rápido Demo para evaluación ágil en Expo Go.

---

## 3. Modelo de Dominio de Notificaciones

### 3.1. Entidad `Notificacion`
```typescript
interface Notificacion {
  id: string;
  usuarioId: string;
  rolDestino: 'Comprador' | 'Organizador';
  tipo: 'COMPRA_CONFIRMADA' | 'CUENTA_REGRESIVA' | 'NUEVO_MENSAJE_CHAT' | 'RECORDATORIO_CALIFICAR' | 'NUEVA_VENTA' | 'CUPO_CRITICO' | 'COMPRA_CANCELADA';
  titulo: string;
  mensaje: string;
  leida: boolean;
  entidadId?: string;
  fechaCreacion: string;
}
```

---

## 4. Esquemas Zod Declarativos (Backend)

```javascript
export const registroCompradorSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().trim().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().trim().email('Formato de email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: z.literal('Comprador').default('Comprador'),
});

export const registroOrganizadorSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre del responsable debe tener al menos 2 caracteres'),
  apellido: z.string().trim().min(2, 'El apellido del responsable debe tener al menos 2 caracteres'),
  nombreProductora: z.string().trim().min(2, 'El nombre de la productora es obligatorio'),
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  razonSocial: z.string().trim().optional(),
  rol: z.literal('Organizador').default('Organizador'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  rolSolicitado: z.enum(['Comprador', 'Organizador']).optional(),
});
```

---

## 5. Escenarios de Aceptación (BDD)

### Escenario 1: Campanita con Badge de No Leídas en Header
* **Dado** un usuario con notificaciones pendientes,
* **Cuando** observa la cabecera (`ScreenHeader`),
* **Entonces** la campanita muestra el badge rojo con el conteo numérico de no leídas. Al tocarla, se abre `NotificationScreen`.

### Escenario 2: Marcado de Notificaciones como Leídas
* **Dado** la pantalla de notificaciones abierta,
* **Cuando** el usuario pulsa sobre una notificación o selecciona "Marcar todas como leídas",
* **Entonces** las notificaciones se actualizan a `leida: true` y el contador del badge se descuenta a cero.

### Escenario 3: Acceso Rápido Demo en Login
* **Dado** la pantalla de `LoginScreen`,
* **Cuando** el usuario pulsa el botón "Entrar como Martina (Comprador)" o "Entrar como Luna Producciones (Organizador)",
* **Entonces** el sistema autentica de inmediato sin pedir credenciales, guarda el token seguro y navega al panel respectivo.

### Escenario 4: Registro de Organizador y Vinculación de Eventos
* **Dado** un nuevo organizador completando nombre, apellido, email, contraseña y nombre de productora ("Indie Live"),
* **Cuando** envía el registro y publica un evento,
* **Entonces** el evento queda vinculado a su `organizadorId`, mostrando su productora en el catálogo y listándolo en su panel de organizador.

---

## 6. Requisitos Verificables
- [x] Esquemas declarativos Zod para registro y login.
- [x] Endpoints `/api/auth/register/buyer`, `/api/auth/register/organizer`, `/api/auth/login`, `/api/auth/demo`.
- [x] Endpoints `/api/notificaciones` y `/api/notificaciones/:id/leida`.
- [x] Abstracción segura con `expo-secure-store`.
- [x] Componente `NotificationBell` con badge en `ScreenHeader`.
- [x] Pantallas `NotificationScreen`, `LoginScreen`, `RegisterBuyerScreen`, `RegisterOrganizerScreen`.
- [x] 100% tests en verde (`npm test`).
