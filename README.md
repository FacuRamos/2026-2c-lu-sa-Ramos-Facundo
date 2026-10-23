# AI Ticket It - Sistema Integral de Venta de Entradas para Eventos

Plataforma móvil y backend para la gestión y compra de entradas a eventos, desarrollada en el marco de **Diseño y Desarrollo de Software (UTN 2026)**.

El repositorio está estructurado como un monorepo modular:
- **`packages/backend`**: API REST en Node.js y Express con arquitectura en capas, validación de requests con Zod en controladores, DTOs de salida mapeados en servicios, base de datos en memoria / JSON y tests automatizados.
- **`packages/frontend`**: Aplicación móvil nativa en React Native y Expo, con fidelidad exacta a los mockups de diseño, navegación fluida con React Navigation, 17 pantallas funcionales (Comprador y Organizador) y sistema de tokens visuales.

---

## 📂 Estructura del Monorepo

```
2026-2c-lu-sa-Ramos-Facundo/
├── package.json                   # Scripts del monorepo (test, start:backend, start:frontend)
├── postman_collection.json        # Colección Postman completa con variables y ejemplos de test
├── packages/
│   ├── backend/                   # API REST Express + Zod + Tests
│   │   ├── src/
│   │   │   ├── domain/entities/   # Entidades de dominio ricas (Usuario, Evento, Compra, etc.)
│   │   │   ├── controllers/       # Controladores con validación Zod integrada
│   │   │   ├── services/          # Lógica de negocio y mappers.js (DTOs)
│   │   │   ├── repositories/      # Repositorios en memoria y persistencia
│   │   │   ├── routes/            # Ruteo Express modular
│   │   │   └── data/seeders/      # Semillero con datos de prueba
│   │   ├── tests/                 # 47 tests unitarios y de integración
│   │   └── package.json
│   └── frontend/                  # App móvil React Native + Expo
│       ├── src/
│       │   ├── constants/theme.js # Sistema de diseño y tokens de color oficiales
│       │   ├── context/           # AppContext con estado reactivo unificado
│       │   ├── components/        # Componentes reutilizables (common, events, purchases, chat, organizer)
│       │   ├── screens/           # 17 pantallas (buyer y organizer)
│       │   ├── navigation/        # RootNavigator y BuyerTabNavigator
│       │   └── services/          # apiService desacoplado
│       ├── tests/                 # 24 tests de interfaz, tokens y lógica
│       └── package.json
```

---

## 🚀 Puesta en Marcha

### Prerrequisitos
- **Node.js** >= 20 LTS (recomendado **Node 22 LTS**, configurable vía `.nvmrc` con `nvm use` o `fnm use`).
- **npm** >= 9 (o npm 10 con Node 22).
- Navegador web moderno o dispositivo móvil con la app **Expo Go** (Android o iOS).

---

### 1. Ejecutar Tests Automatizados

Para ejecutar todos los tests del monorepo (96 tests en total):
```bash
npm test
```

O por paquete individual:
```bash
npm run test:backend   # Ejecuta los 55 tests del backend
npm run test:frontend  # Ejecuta los 41 tests del frontend (hooks, tokens, servicios)
```

---

### 2. Iniciar el Backend

Desde la raíz del monorepo:
```bash
npm run start:backend
```
La API estará disponible en `http://localhost:3000`.

- **Poblar datos iniciales vía script:**
  ```bash
  cd packages/backend
  npm run seed
  ```
- **Poblar datos iniciales vía HTTP:**
  ```http
  POST http://localhost:3000/api/seed
  ```

---

### 3. Iniciar el Frontend Móvil

Desde la raíz del monorepo:
```bash
npm run start:frontend
```
O directamente desde la carpeta del frontend:
```bash
cd packages/frontend
npx expo start
```

Se abrirá el servidor de desarrollo de Metro con un código QR:
- **Android / iOS:** Escaneá el código QR desde la aplicación **Expo Go**.
- **Emulador Android:** Presioná `a` en la terminal.
- **Simulador iOS:** Presioná `i` en la terminal.

---

## 🎨 Frontend Móvil (`packages/frontend`)

### Paleta de Colores Oficial
- **Fondo:** `#F4F2EE`
- **Superficies:** `#FFFFFF`
- **Texto Principal:** `#353735`
- **Texto Secundario:** `#85847E`
- **Color Principal (Azul petróleo):** `#46717A`
- **Fondo Secundario / Píldoras:** `#EAECE8`
- **Estados (Colores Pastel):**
  - Confirmado: `#DCE9DE` (Texto: `#4F7258`)
  - Pendiente: `#F1E8D5` (Texto: `#806B45`)
  - Cancelado: `#F0DEDA` (Texto: `#8A5D58`)
  - Utilizado: `#EAECE8` (Texto: `#46717A`)

### Pantallas Implementadas (17)
- **Comprador:**
  1. *Inicio:* Destacados, selector de categorías, eventos para vos.
  2. *Búsqueda:* Filtro por nombre, categoría y ordenamiento (precio, fecha, puntaje organizador).
  3. *Detalle del Evento:* Banner, fecha, organizador, tipos de entrada y reseñas.
  4. *Selección de Entradas:* Incremento/decremento respetando cupos, desglose y total.
  5. *Detalle y Confirmación de Compra:* Días restantes, desglose, acceso al chat y cancelación con restitución de cupo.
  6. *Mis Compras:* Pestañas de filtrado (Todas, Próximas, Pasadas) y botón para calificar.
  7. *Chat de la Compra:* Conversación bidireccional entre comprador y organizador.
  8. *Calificar Evento:* Sistema de estrellas (1-5) con validación de entrada utilizada.
  9. *Favoritos:* Guardado y eliminación rápida de eventos favoritos.
  10. *Perfil:* Estadísticas y switch para alternar entre perfil Comprador y Organizador.
- **Organizador:**
  11. *Panel Principal:* Métricas de eventos, ventas, recaudación y accesos rápidos.
  12. *Crear Evento:* Formulario completo y agregado dinámico de tipos de entrada.
  13. *Gestionar Evento:* Métricas, stock en barras de progreso y accesos a chat y ventas.
  14. *Compras del Evento:* Listado de compradores con importe, entradas y estado.
  15. *Chat del Organizador:* Bandeja de entrada con compradores y respuestas directas.

---

## ⚙️ Backend y API (`packages/backend`)

### Decisiones de Arquitectura
1. **Validación Zod en Controladores:** Cada controlador valida el body y query params usando schemas Zod declarativos (`safeParse`), devolviendo errores HTTP 400 uniformes con detalle de los campos inválidos.
2. **DTOs de Salida Delegados:** La transformación y filtrado de datos salientes (evitar fuga de emails, contraseñas o favoritos) está encapsulada en `src/services/mappers.js`, liberando a los controladores de dicha responsabilidad.
3. **Reglas de Dominio Protegidas:**
   - No se pueden comprar más entradas de las disponibles por cupo.
   - Cancelar una compra restituye automáticamente el cupo disponible del tipo de entrada.
   - No se puede cancelar una entrada utilizada o de un evento pasado.
   - Sólo se puede calificar un evento si se posee una compra en estado `UTILIZADA`.
   - El chat de compra sólo permite mensajes entre el comprador y el organizador del evento.

### Pruebas con Postman
Importá el archivo `postman_collection.json` presente en la raíz del repositorio en Postman. Incluye requests preconfiguradas para todos los endpoints:
- `POST /api/seed`
- `GET /api/eventos` (con filtros de texto, categoría, rango de precios y orden)
- `POST /api/eventos`
- `POST /api/compras`
- `GET /api/compras`
- `PATCH /api/compras/:id/cancelar`
- `POST /api/compras/:id/mensajes`
- `POST /api/resenias`
