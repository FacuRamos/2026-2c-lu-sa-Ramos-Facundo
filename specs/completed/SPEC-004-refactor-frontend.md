# [SPEC-004] Refactorización Arquitectónica del Frontend Móvil (React Native)

## 1. Intención
Desacoplar la lógica de negocio y estado de los componentes visuales en la aplicación móvil (`packages/frontend`), mediante la extracción de Custom Hooks dedicados, la descomposición de vistas monolíticas en componentes atómicos y la estandarización absoluta del sistema de diseño (`theme.js`), aplicando las directrices de optimización de *vercel-react-best-practices* y *frontend-design* sin alterar los contratos de navegación ni romper las pruebas automatizadas.

---

## 2. Escenarios de Aceptación (BDD)

### Escenario 1: Extracción de Custom Hooks (Separación UI y Lógica de Negocio)
* **Dado** pantallas con lógica de estado asíncrono, filtrado, ordenamiento o mensajería (como `HomeScreen`, `SearchScreen`, `PurchasesScreen` y `ChatScreen`),
* **Cuando** se refactorizan utilizando Custom Hooks dedicados (`useEvents`, `useEventSearch`, `usePurchases`, `useChat`),
* **Entonces** las pantallas delegan la captura, validación y mutación de datos al hook correspondiente, exponiendo una interfaz declarativa y reduciendo la complejidad ciclomática de las vistas.

### Escenario 2: Descomposición de pantallas complejas en subcomponentes atómicos
* **Dado** pantallas con múltiples secciones visuales acopladas en un solo archivo (como el encabezado de bienvenida en `HomeScreen` o el modal de ordenamiento en `SearchScreen`),
* **Cuando** se descomponen en subcomponentes especializados e independientes (ej. `HomeGreeting`, `SortModal`, `PurchaseTabs`),
* **Entonces** cada subcomponente cumple con el principio de responsabilidad única (SRP), recibe propiedades tipadas/claras y puede testearse o reutilizarse de forma aislada.

### Escenario 3: Consistencia total del Sistema de Diseño (Theme Tokens)
* **Dado** los estilos definidos en componentes y pantallas del frontend,
* **Cuando** se auditan valores de espaciado, radios de borde, sombras y colores,
* **Entonces** se erradican los valores literales o "hardcodeados" (ej. `#333`, `#eee`, `12`, `16` sueltos) migrándolos al 100% hacia los tokens centrales de `src/constants/theme.js` (`COLORS`, `SPACING`, `FONTS`, `RADIUS`, `SHADOWS`).

### Escenario 4: Optimización de renderizado en colecciones y listas (Vercel React Best Practices)
* **Dado** listados con volumen variable de elementos (eventos destacados, compras, mensajes de chat),
* **Cuando** se renderizan mediante componentes nativos optimizados (`FlatList` con `keyExtractor` estable, `getItemLayout` cuando la altura es uniforme, y funciones `renderItem` memoizadas/estables fuera del ciclo de render),
* **Entonces** se previenen re-renders innecesarios (`rerender-memo`, `rerender-no-inline-components`), garantizando un scroll fluido a 60 FPS tanto en dispositivos móviles como en web.

---

## 3. Requisitos Verificables
- [x] Crear el directorio `packages/frontend/src/hooks/` y los Custom Hooks:
  - `useEvents.js`: lógica de destacados, filtrado por categorías y refresco.
  - `useEventSearch.js`: debounce/búsqueda por texto, filtrado multidimensional y ordenamiento.
  - `usePurchases.js`: filtrado por pestañas (Todas, Próximas, Pasadas) y ciclo de vida de compras.
  - `useChat.js`: carga de mensajes, scroll automático y despacho de mensajes bidireccionales.
- [x] Extraer subcomponentes visuales especializados:
  - `packages/frontend/src/components/home/HomeGreeting.js`
  - `packages/frontend/src/components/search/SortModal.js`
  - `packages/frontend/src/components/purchases/PurchaseTabs.js`
- [x] Refactorizar `HomeScreen`, `SearchScreen`, `PurchasesScreen` y `ChatScreen` para consumir los hooks y subcomponentes.
- [x] Auditar y reemplazar cualquier color o espaciado literal residual por su token correspondiente en `src/constants/theme.js`.
- [x] Preservar intactos los nombres de rutas, parámetros de navegación y contratos de `AppContext` y `apiService`.

---

## 4. Criterios de Aceptación Medibles
- Los 41 tests unitarios del frontend (`npm run test:frontend`) pasan al 100% con 0 fallos.
- La suite completa de 96 tests del monorepo (`npm test`) pasa al 100% con 0 fallos.
- 0 advertencias de renderizado o hooks en la consola de Expo/Metro.
- 100% de cumplimiento en la separación de UI y Lógica de Negocio.
