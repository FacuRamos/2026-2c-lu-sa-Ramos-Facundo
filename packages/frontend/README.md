# AI Ticket It - Frontend Móvil (React Native + Expo)

Frontend móvil de **AI Ticket It**, desarrollado en **React Native** con **Expo**, **React Navigation** y estilos nativos mediante `StyleSheet`.

La aplicación traduce de forma exacta el diseño visual, la experiencia de usuario y la paleta de colores del prototipo de AI Ticket It, implementando navegación real, gestión de estados de interfaz (carga, error, vacío, confirmación), reglas de negocio y flujos completos para ambos perfiles de usuario: **Comprador** y **Organizador**.

---

## 🎨 Paleta y Sistema de Diseño

Se definieron los tokens visuales centralizados en `src/constants/theme.js`:

- **Fondo principal:** `#F4F2EE`
- **Superficies / Tarjetas:** `#FFFFFF`
- **Texto principal:** `#353735`
- **Texto secundario:** `#85847E`
- **Color de acento primario:** `#46717A` (Azul petróleo suave)
- **Fondo secundario / Píldoras:** `#EAECE8`
- **Estados con colores pastel:**
  - Confirmada: `#DCE9DE` (texto `#4F7258`)
  - Pendiente: `#F1E8D5` (texto `#806B45`)
  - Cancelada: `#F0DEDA` (texto `#8A5D58`)
  - Utilizada: `#EAECE8` (texto `#46717A`)
- **Puntuaciones / Estrellas:** `#D8B66F`
- **Bordes:** `#E1E2DD`

---

## 📱 Pantallas Implementadas

### Perfil Comprador
1. **Inicio (`HomeScreen`):** Saludo, buscador rápido, selector de categorías por píldoras, carrusel de eventos destacados ("Destacados") y listado vertical ("Para vos").
2. **Búsqueda de eventos (`SearchScreen`):** Búsqueda en tiempo real por texto (nombre, descripción, lugar), filtro por categorías y ordenamiento dinámico por precio (asc/desc), fecha (asc/desc) y mejor puntuación del organizador con contador de resultados y estado vacío.
3. **Detalle del evento (`EventDetailScreen`):** Imagen de portada, categoría con badge, rating con estrellas, descripción, fecha, ubicación, tarjeta de organizador verificado, listado de tipos de entrada con cupo disponible y botón de selección, y reseñas de asistentes.
4. **Selección de entradas (`TicketSelectionScreen`):** Miniatura del evento, selector de cantidad por entrada (`+` / `-`) respetando el cupo máximo disponible, desglose en tiempo real y cálculo del total abonado, aviso de compra protegida y confirmación.
5. **Confirmación y Detalle de compra (`PurchaseDetailScreen`):** Resumen de la compra, estado actual en badge pastel, desglose de entradas y total pagado, cuenta regresiva de días restantes ("Faltan X días"), acceso directo al chat con el organizador y acción de cancelación con restitución de cupo.
6. **Mis compras (`PurchasesScreen`):** Listado de compras con pestañas de filtrado ("Todas", "Próximas", "Pasadas"), estado de cada ticket y acceso directo a calificar si la entrada fue utilizada.
7. **Chat de una compra (`ChatScreen`):** Mensajería en tiempo real entre comprador y organizador, burbujas diferenciadas por remitente, fecha/hora y envío de mensajes.
8. **Calificar evento (`ReviewScreen`):** Selector interactivo de estrellas (1 a 5), campo de comentario y validación de regla de negocio (únicamente se puede calificar si la compra está en estado `UTILIZADA`). Listado de reseñas existentes.
9. **Favoritos (`FavoritesScreen`):** Listado de eventos guardados con toggle rápido de favoritos y navegación a detalle.
10. **Perfil (`ProfileScreen`):** Datos del usuario, estadísticas de compras y favoritos, accesos a historial y selector rápido para alternar entre perfil Comprador y Organizador.

### Perfil Organizador
11. **Panel principal (`OrganizerDashboardScreen`):** Resumen de métricas (eventos publicados, entradas vendidas, ingresos), botón de acceso rápido para crear nuevo evento, listado de mis eventos y banner de crecimiento mensual.
12. **Crear evento (`CreateEventScreen`):** Formulario con validación completa (nombre, descripción, selector de categoría, fecha, ubicación, imagen) y configuración dinámica de tipos de entrada (agregar, quitar, definir nombre, precio y cupo).
13. **Gestionar evento (`ManageEventScreen`):** Portada del evento, métricas de vendidas/disponibles/ingresos, accesos rápidos a Compras y Mensajes, y barras de progreso de disponibilidad por tipo de entrada.
14. **Compras del evento (`OrganizerSalesScreen`):** Listado de compradores con cantidad de entradas, importe abonado y estado con badges pastel. Filtros por estado.
15. **Chat del organizador (`OrganizerInboxScreen`):** Bandeja de entrada con listado de conversaciones activas por compra con compradores, badge de mensajes no leídos y respuesta directa.

---

## 🏗️ Arquitectura del Proyecto

```
packages/frontend/
├── assets/                       # Iconos y recursos gráficos
├── tests/                        # Tests automatizados (Node test runner)
│   ├── apiService.test.js        # Tests de lógica de negocio, cupos, filtros y compras
│   └── componentsAndTokens.test.js # Tests de consistencia de tokens de diseño
├── src/
│   ├── constants/
│   │   ├── theme.js              # Colores, espaciados, radios y sombras
│   │   └── roles.js              # Roles (Comprador / Organizador) y usuarios demo
│   ├── data/
│   │   └── mockData.js           # Datos iniciales realistas (alineados con backend y mockups)
│   ├── services/
│   │   └── apiService.js         # Capa de servicio desacoplada con gestión de estado
│   ├── context/
│   │   └── AppContext.js         # Contexto global de React (estado, compras, eventos, favoritos, chat)
│   ├── components/
│   │   ├── common/               # ScreenHeader, PrimaryButton, SecondaryButton, StatusBadge,
│   │   │                         # SearchBar, CategorySelector, FormInput, RatingStars,
│   │   │                         # LoadingSpinner, EmptyState, ErrorMessage
│   │   ├── events/               # EventCard, TicketTypeCard
│   │   ├── purchases/            # PurchaseCard
│   │   ├── chat/                 # ChatMessage
│   │   └── organizer/            # StatCard, QuickAction, TicketStockBar, SaleItem
│   ├── screens/
│   │   ├── buyer/                # Pantallas del flujo de Comprador
│   │   └── organizer/            # Pantallas del flujo de Organizador
│   └── navigation/
│       ├── BuyerTabNavigator.js  # Barra de navegación inferior
│       └── RootNavigator.js      # Navegador de pila principal
├── App.js                        # Entrada de la aplicación con Providers
├── app.json                      # Configuración de Expo
└── package.json                  # Dependencias y scripts
```

---

## 🚀 Ejecución de la Aplicación

### Requisitos previos
- Node.js >= 18 (verificado con v20)
- npm

### 1. Iniciar el frontend
Desde el directorio raíz:
```bash
npm run start:frontend
```
O dentro de `packages/frontend`:
```bash
npm start
```

Podés escanear el código QR con **Expo Go** en tu dispositivo físico Android/iOS, o presionar `a` para emulador Android o `i` para simulador iOS.

### 2. Ejecutar pruebas automatizadas
Para ejecutar los tests del frontend:
```bash
npm run test:frontend
```
Para ejecutar todos los tests (backend + frontend):
```bash
npm test
```
Resultados: 100% de tests aprobados (24 tests en frontend y 47 tests en backend).
