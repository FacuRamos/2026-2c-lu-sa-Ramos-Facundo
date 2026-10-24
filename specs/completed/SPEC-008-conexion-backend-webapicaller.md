# [SPEC-008] Conexión Backend vía WebApiCaller y Modularización de Servicios en Frontend

> **Metodología:** Spec-Driven Development (SDD) - Cátedra de Diseño y Desarrollo de Software (UTN)  
> **Estado:** Completado y Aprobado  
> **Dependencias:** SPEC-001 a SPEC-007 (Completadas y Aprobadas)

---

## 1. Intención

Estandarizar y profesionalizar la comunicación cliente-servidor entre la aplicación móvil React Native / Expo (`packages/frontend`) y la API REST en Node.js / Express (`packages/backend`).
Para ello, se implementará un cliente HTTP genérico y centralizado (`webApiCaller`) con resolución dinámica de host según entorno, inyección automática de tokens de seguridad desde el Hardware Keystore (`expo-secure-store`), serialización JSON, gestión de timeouts y mapeo uniforme de excepciones HTTP (400 Zod, 401, 404, 500).

Asimismo, se refactorizará el servicio monolítico `apiService.js` descomponiéndolo en una suite de servicios modulares y cohesivos por contexto de negocio dentro de `packages/frontend/src/services/api/`:
- `eventsService.js` (Catálogo, filtros, detalle y publicación de eventos)
- `purchasesService.js` (Compra de tickets, listados y cancelación)
- `chatService.js` (Mensajería bidireccional entre comprador y organizador)
- `reviewsService.js` (Calificaciones y reputación de productoras)
- `organizerService.js` (Métricas de ventas y dashboards del organizador)
- `authService.js` (Login, registros diferenciados y acceso rápido demo)
- `notificationsService.js` (Campanita, conteo de no leídas y triggers)

Para evitar regresiones en las vistas de la UI, se dispondrá un **Barrel Export / Fachada** en `packages/frontend/src/services/api/index.js` y `packages/frontend/src/services/apiService.js` que preservará íntegramente la interfaz pública consumida por `AppContext.js` y los tests existentes.

---

## 2. Diseño Arquitectónico

### 2.1. Arquitectura de `webApiCaller`
`webApiCaller` provee una interfaz unificada y tipada para operaciones HTTP:
- `get(endpoint, options)`
- `post(endpoint, body, options)`
- `put(endpoint, body, options)`
- `patch(endpoint, body, options)`
- `delete(endpoint, options)`
- `update(endpoint, body, options)` *(alias inteligente para patch/put)*

#### Resolución Dinámica de `BASE_URL`:
1. Variable de entorno explícita `process.env.EXPO_PUBLIC_API_URL`.
2. Emulador Android nativo: `http://10.0.2.2:3000/api`.
3. Simulador iOS / Entorno Web / Tests: `http://localhost:3000/api`.
4. Dispositivo físico con Expo Go en LAN: detección de IP local del host desde Constants o fallback configurable.

#### Inyección de Credenciales y Cabeceras:
- Consulta asíncrona de token JWT en `secureStoreService.getItem(SECURE_KEYS.AUTH_TOKEN)`.
- Cabecera estándar `Authorization: Bearer <token>`.
- Cabecera `Content-Type: application/json`.
- Timeout predeterminado con `AbortController` (8000ms).

#### Transformación Centralizada de Errores:
- **Error 400 (Validation Error / Zod):** Extrae mensajes detallados de validación provistos por el backend (`err.message` o `err.details`).
- **Error 401 / 403 (Unauthorized / Forbidden):** Retorna `AuthenticationError` o `ForbiddenError`.
- **Error 404 (Not Found):** Retorna `NotFoundError`.
- **Error 409 (Conflict):** Retorna `ConflictError` (ej: emails duplicados, transición de estado inválida).
- **Network / Timeout Error:** Retorna `NetworkError` con mensaje amigable sin congelar la interfaz.

---

### 2.2. Diagrama de la Nueva Estructura Modular

```
packages/frontend/src/services/
├── api/
│   ├── client/
│   │   ├── webApiCaller.js        <-- Cliente HTTP base genérico
│   │   ├── config.js              <-- Resolución dinámica de BASE_URL y timeouts
│   │   └── apiError.js            <-- Clases de error estructuradas
│   ├── eventsService.js           <-- Eventos, categorías y filtros
│   ├── purchasesService.js        <-- Compras y cancelaciones
│   ├── chatService.js             <-- Mensajería de compras
│   ├── reviewsService.js          <-- Calificaciones y reseñas
│   ├── organizerService.js        <-- Métricas de ventas y dashboard
│   ├── authService.js             <-- Autenticación y registro
│   ├── notificationsService.js    <-- Centro de notificaciones
│   └── index.js                   <-- Barrel export de servicios modulares
├── apiService.js                  <-- Fachada compatible hacia AppContext
└── secureStoreService.js          <-- Hardware keystore (Keychain / KeyStore)
```

---

## 3. Escenarios de Aceptación (BDD)

### Escenario 1: Petición exitosa mediante `webApiCaller` parseando DTOs
* **Dado** el servidor backend en ejecución o simulado en tests de integración,
* **Cuando** un servicio modular invoca `webApiCaller.get('/eventos')`,
* **Entonces** el cliente resuelve la URL correcta, serializa la petición, parsea la respuesta JSON y devuelve la colección de eventos según los DTOs oficiales del backend.

### Escenario 2: Captura y transformación de error 400 Zod
* **Dado** un formulario con datos incompletos o inválidos (ej: registro de organizador sin `nombreProductora`),
* **Cuando** el cliente envía la petición mediante `webApiCaller.post('/auth/register/organizer', payloadInvalido)`,
* **Entonces** el servidor responde HTTP 400, y `webApiCaller` lanza un `ApiError` estructurado con el mensaje específico de Zod para ser visualizado en la alerta de la UI.

### Escenario 3: Conexión dinámica configurable según entorno
* **Dado** una ejecución en emulador Android, simulador iOS o dispositivo Expo Go,
* **Cuando** se inicializa `webApiCaller`,
* **Entonces** la `BASE_URL` se resuelve automáticamente al gateway adecuado (`10.0.2.2`, `localhost` o la IP LAN definida en `EXPO_PUBLIC_API_URL`).

### Escenario 4: Consumo desacoplado desde cada servicio modular
* **Dado** `AppContext.js` interactuando con `eventsService`, `purchasesService`, `chatService`, `reviewsService` y `organizerService`,
* **Cuando** se ejecuta cualquier operación de los 12 casos de uso,
* **Entonces** cada módulo gestiona exclusivamente su lógica de dominio delegando las llamadas HTTP en `webApiCaller` con cero regresiones en los componentes visuales.

---

## 4. Requisitos Verificables

- [x] Crear `packages/frontend/src/services/api/client/webApiCaller.js` con soporte para `get`, `post`, `put`, `patch`, `delete` y `update`.
- [x] Crear `packages/frontend/src/services/api/client/config.js` y `packages/frontend/src/services/api/client/apiError.js`.
- [x] Crear módulos especializados en `packages/frontend/src/services/api/`:
  - `eventsService.js`
  - `purchasesService.js`
  - `chatService.js`
  - `reviewsService.js`
  - `organizerService.js`
  - `authService.js`
  - `notificationsService.js`
- [x] Crear Barrel Export / Fachada en `packages/frontend/src/services/api/index.js` y mantener retrocompatibilidad total en `packages/frontend/src/services/apiService.js`.
- [x] Proveer estrategia de resiliencia / fallback para no romper los tests existentes ni la experiencia en Expo Go offline.
- [x] Crear suite de pruebas de cliente HTTP y servicios modulares en `packages/frontend/tests/webApiCaller.test.js`.
- [x] Mantener el 100% de la suite monorepo en verde (`npm test`).

---

## 5. Criterios de Aceptación Medibles

1. **100% Tests en Verde:** Todos los tests de backend y frontend pasan sin errores (`npm test`).
2. **Cobertura de Métodos HTTP:** `webApiCaller` cuenta con pruebas unitarias para `get`, `post`, `patch`, `put`, `delete` y manejo de errores (400, 401, 404, 500, Timeout).
3. **Cero Regresiones:** Ninguna pantalla ni hook de UI experimenta errores ni cambios de firma en sus llamadas.
