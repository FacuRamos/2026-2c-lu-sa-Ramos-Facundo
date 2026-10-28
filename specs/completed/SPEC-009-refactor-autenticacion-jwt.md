# [SPEC-009] Refactor Integral de Autenticación y Autorización con JWT y BCrypt

> **Metodología:** Spec-Driven Development (SDD) - Cátedra de Diseño y Desarrollo de Software (UTN)  
> **Referencia Académica:** Cátedra DDS UTN - *Clase Semana 10: Autenticación, JWT, RBAC y Seguridad en APIs REST*  
> **Estado:** Completado y Aprobado  
> **Dependencias:** SPEC-001 a SPEC-008 (Completadas y Aprobadas)  

---

## 1. Intención

Reemplazar la simulación y validación superficial de identidad por un sistema robusto, sin estado (*stateless*), de **Autenticación (AuthN)** y **Control de Acceso Basado en Roles (RBAC / AuthZ)**, aplicando estrictamente los estándares de la industria y las directrices teóricas y prácticas de la **Clase Semana 10 de la UTN**.

El refactor garantiza:
1. **Seguridad en Reposo (At Rest):** Las contraseñas de los usuarios (compradores, organizadores y semillas) se almacenan protegidas mediante algoritmos de hashing adaptativos unidireccionales con salt (`bcrypt`), erradicando cualquier persistencia o comparación en texto plano.
2. **Identidad Stateless con JWT:** Emisión de tokens de acceso criptográficos firmados con `jsonwebtoken`, conteniendo claims estándar (`sub: user.id`, `role: user.rol`, `email: user.email`), firmados con `JWT_SECRET` configurable en variables de entorno y con expiración controlada (`15m` por defecto).
3. **Control de Acceso en Backend (RBAC):** Creación de middlewares desacoplados:
   - `authMiddleware`: Valida la cabecera `Authorization: Bearer <token>`, gestiona errores de firma o expiración (HTTP 401) e inyecta la identidad en `req.user`.
   - `requireRole(...roles)`: Valida los privilegios del usuario autenticado, respondiendo HTTP 403 Forbidden ante accesos no autorizados.
4. **Premisa Cátedra:** *"Esconder no es proteger; la autorización real se valida SIEMPRE en el backend"* (Slide 70). Toda operación sensible (publicar eventos, ver ventas, comprar, cancelar y calificar) queda blindada en el servidor.
5. **Transparencia en el Frontend:** El cliente HTTP (`webApiCaller`) inyecta el token de seguridad desde el Hardware Keystore (`expo-secure-store`) y maneja de manera centralizada las respuestas 401 y 403.

---

## 2. Diagnóstico del Repositorio vs. Clase Semana 10

| Concepto Clase Semana 10 | Estado Actual en Repositorio | Refactor Requerido (SPEC-009) |
| :--- | :--- | :--- |
| **Almacenamiento de Contraseñas (Slide 63)** | Contraseñas en texto plano en `Usuario.js`, `demoSeeder.js` y `AuthService.js`. | Hasheo con `bcrypt.hash(password, 10)` al registrar y en semillas; verificación con `bcrypt.compare`. |
| **Emisión de Tokens JWT (Slides 58-63)** | Firma manual artesanal con `crypto.createHmac`, secreto hardcodeado y expiración fija de 24h. | Uso oficial de librería `jsonwebtoken`, claims normalizados `{ sub, role, email }`, expiración `15m` y `JWT_SECRET` en `.env`. |
| **Validación de Autenticación (Slide 64)** | No existe middleware de autenticación en Express; rutas abiertas a peticiones anónimas. | Middleware `authMiddleware` que verifica `Authorization: Bearer <token>`, inyecta `req.user` o responde 401. |
| **Control de Acceso por Roles (Slides 69-70)** | Roles solo condicionan la UI en el cliente móvil (`userRole === 'Organizador'`). El backend no protege endpoints. | Middleware `requireRole('Organizador')` y `requireRole('Comprador')` respondiendo HTTP 403 ante privilegios insuficientes. |
| **Endpoint de Verificación de Identidad** | Inexistente. | Endpoint estándar `GET /api/auth/me` protegido que devuelve el perfil del usuario autenticado desde `req.user`. |
| **Respuestas a Credenciales Inválidas** | Mensajes a veces diferenciados o no normalizados. | Respuesta genérica `HTTP 401: Credenciales inválidas` para prevenir enumeración de usuarios (Slide 62). |
| **Inyección en Frontend (Slides 9, 68)** | `webApiCaller` añade token, pero no captura eventos de expiración (401/403) para forzar re-login limpio. | Manejo de excepciones 401/403 en `webApiCaller` y propagación hacia `AppContext` para cerrar sesión segura. |

---

## 3. Matriz de Autorización de Endpoints (RBAC)

| Endpoint | Método | Acceso Requerido | Descripción |
| :--- | :---: | :---: | :--- |
| `/api/auth/register/buyer` | POST | **Público** | Registro de nuevos compradores |
| `/api/auth/register/organizer` | POST | **Público** | Registro de nuevos organizadores |
| `/api/auth/login` | POST | **Público** | Inicio de sesión con email y password |
| `/api/auth/demo` | POST | **Público** | Acceso rápido para evaluación demo |
| `/api/auth/me` | GET | **Autenticado (Cualquier rol)** | Devuelve el usuario activo a partir del token |
| `/api/categorias` | GET | **Público** | Catálogo público de categorías |
| `/api/eventos` | GET | **Público** | Búsqueda y listado público de eventos |
| `/api/eventos/:id` | GET | **Público** | Detalle público del evento |
| `/api/eventos` | POST | **Organizador** (`requireRole('Organizador')`) | Creación de nuevos eventos y cupos |
| `/api/compras` | POST | **Comprador** (`requireRole('Comprador')`) | Compra de tickets |
| `/api/compras/comprador/:id`| GET | **Comprador** (`authMiddleware`) | Listado de entradas del comprador |
| `/api/compras/organizador/:id`| GET | **Organizador** (`requireRole('Organizador')`) | Ventas de eventos del organizador |
| `/api/compras/:id/cancelar` | POST | **Comprador** (`requireRole('Comprador')`) | Cancelación de compra y liberación de cupo |
| `/api/compras/:id/mensajes` | POST | **Autenticado** (`authMiddleware`) | Envío de mensajes en el chat de la compra |
| `/api/resenias` | POST | **Comprador** (`requireRole('Comprador')`) | Calificación de evento con compra utilizada |
| `/api/notificaciones` | GET / PATCH | **Autenticado** (`authMiddleware`) | Gestión de notificaciones por usuario |

---

## 4. Escenarios de Aceptación (BDD)

### Escenario 1: Login exitoso con verificación BCrypt y emisión de JWT
* **Dado** un usuario registrado con contraseña hasheada en el sistema.
* **Cuando** el cliente envía `POST /api/auth/login` con email y contraseña correctos.
* **Entonces** el servidor verifica el hash mediante `bcrypt.compare`, retorna HTTP 200 con el token JWT firmado conteniendo `{ sub, role, email }` y un tiempo de expiración válido.

### Escenario 2: Intento de login con credenciales inválidas (Seguridad anti-enumeración)
* **Dado** un usuario existente en la base de datos o un email no registrado.
* **Cuando** el cliente envía `POST /api/auth/login` con credenciales incorrectas.
* **Entonces** el servidor responde HTTP 401 con mensaje uniforme `"Credenciales inválidas"` sin revelar si el error fue de email o contraseña.

### Escenario 3: Petición a endpoint protegido con token válido
* **Dado** un usuario autenticado portando un token JWT vigente en la cabecera `Authorization: Bearer <token>`.
* **Cuando** realiza una petición a un endpoint protegido (ej: `GET /api/auth/me`).
* **Entonces** el `authMiddleware` verifica la firma y vigencia, inyecta los claims en `req.user` y permite la ejecución del controlador con HTTP 200.

### Escenario 4: Rechazo por token ausente, malformado o expirado
* **Dado** una petición a un endpoint protegido sin cabecera `Authorization`, con formato inválido o con un token cuya expiración (`exp`) fue superada.
* **Cuando** el servidor procesa la solicitud mediante `authMiddleware`.
* **Entonces** responde inmediatamente con HTTP 401 Unauthorized y un cuerpo de error descriptivo sin ejecutar el controlador.

### Escenario 5: Control de Acceso Basado en Roles (403 Forbidden)
* **Dado** un usuario autenticado con rol `Comprador`.
* **Cuando** intenta realizar una acción exclusiva de organizadores (por ejemplo, `POST /api/eventos` para dar de alta un evento).
* **Entonces** el middleware `requireRole('Organizador')` detecta la discrepancia de permisos y responde con HTTP 403 Forbidden (`"Acceso denegado: permisos insuficientes"`).

### Escenario 6: Inyección transparente en el Frontend y captura de 401/403
* **Dado** un token de sesión almacenado en `secureStoreService`.
* **Cuando** la aplicación móvil realiza peticiones mediante `webApiCaller`.
* **Entonces** se adjunta automáticamente el Bearer token, y en caso de recibir un status 401/403, se maneja el error sin congelar la interfaz, notificando al usuario o conduciéndolo al flujo de autenticación.

---

## 5. Requisitos Verificables

- [ ] **Dependencias Backend:** Agregar `bcrypt` y `jsonwebtoken` en `packages/backend/package.json`.
- [ ] **Variables de Entorno:** Soportar `JWT_SECRET` (con fallback de desarrollo seguro) y `JWT_EXPIRES_IN` en `packages/backend/.env`.
- [ ] **Entidad y Seeder:**
  - [ ] Métodos auxiliares en `Usuario.js` para hash y comparación de passwords.
  - [ ] `demoSeeder.js` inicializa todos los usuarios de prueba con contraseñas hasheadas mediante `bcrypt`.
- [ ] **Servicio de Autenticación (`AuthService.js`):**
  - [ ] Migración de firma manual HMAC a `jsonwebtoken.sign`.
  - [ ] Verificación de contraseñas con `bcrypt.compare`.
  - [ ] Claims estandarizados `{ sub, role, email }`.
- [ ] **Middlewares de Seguridad en Backend:**
  - [ ] `authMiddleware.js`: Validación de `Authorization: Bearer <token>` y población de `req.user`.
  - [ ] `requireRole.js`: Validación de roles permitidos (`Comprador`, `Organizador`).
- [ ] **Protección de Rutas:** Aplicación de los middlewares en `eventoRoutes.js`, `compraRoutes.js`, `reseniaRoutes.js` y `authRoutes.js`.
- [ ] **Endpoint `/api/auth/me`:** Implementado en `authRoutes.js` y `AuthController.js`.
- [ ] **Frontend Client (`webApiCaller.js` y `authService.js`):** Soporte continuo de token en headers y preservación de tests de aislamiento y mocks locales.

---

## 6. Criterios Medibles

1. **Suite de Tests Automatizados:**
   - 100% de tests unitarios y de integración pasando (`npm test`) tanto en `packages/backend` como en `packages/frontend`.
   - Incorporación de tests exhaustivos en `packages/backend/tests/authJwt.test.js` cubriendo:
     - Hashing con bcrypt y comparación.
     - Login exitoso y generación de JWT con claims correctos.
     - Login fallido con respuesta 401 genérica.
     - Validación de `authMiddleware` (token válido, ausente, malformado, vencido).
     - Validación de `requireRole` (acceso concedido vs. 403 Forbidden).
2. **Cero regresiones:** Mantenimiento de los 146 tests preexistentes en verde.
3. **Seguridad Verificada:** Ninguna contraseña en texto plano en repositorios ni respuestas JSON (los mappers DTO excluyen `password`).
