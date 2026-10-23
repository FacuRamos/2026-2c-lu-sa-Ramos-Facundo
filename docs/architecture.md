# Arquitectura del Sistema - AI Ticket It

Este documento describe la arquitectura técnica, las responsabilidades por capa y las decisiones estructurales del monorepo.

---

## 🏛️ Estructura General del Monorepo

El proyecto está compuesto por dos paquetes desacoplados:
- **`packages/backend`**: API REST en Node.js y Express 5, estructurada con arquitectura limpia en capas (Clean Architecture / Hexagonal).
- **`packages/frontend`**: Aplicación móvil en React Native con Expo, React Navigation y sistema de tokens de diseño centralizados.

```
2026-2c-lu-sa-Ramos-Facundo/
├── packages/
│   ├── backend/
│   │   └── src/
│   │       ├── domain/entities/     # Capa 1: Entidades puras y lógica de dominio
│   │       ├── services/            # Capa 2: Casos de uso y lógica de negocio
│   │       ├── controllers/         # Capa 3: Entrada HTTP, validación con Zod
│   │       ├── repositories/        # Capa 4: Persistencia y acceso a datos
│   │       ├── routes/              # Configuración de rutas Express
│   │       └── middleware/          # Manejo de errores y utilidades
│   └── frontend/
│       └── src/
│           ├── constants/           # Tokens de diseño (theme.js) y roles
│           ├── context/             # AppContext (estado global unificado)
│           ├── services/            # apiService desacoplado de la UI
│           ├── components/          # Componentes reutilizables (common, events, chat)
│           ├── screens/             # Vistas (buyer y organizer)
│           └── navigation/          # RootNavigator y TabNavigator
```

---

## 🧩 Capas del Backend y Reglas de Dependencia

El backend respeta el principio de inversión de dependencias: las capas internas nunca dependen de las capas externas.

```
       [ HTTP Request ]
              │
              ▼
    ┌──────────────────┐
    │   Controllers    │  <- Validación de esquemas con Zod
    └─────────┬────────┘
              │ invoca
              ▼
    ┌──────────────────┐
    │    Services      │  <- Casos de uso y orquestación
    └────┬────────┬────┘
         │        │ transforma con mappers.js (DTOs)
         │        ▼
         │   ┌──────────────────┐
         │   │  Domain Entities │  <- Entidades ricas y reglas de negocio
         │   └──────────────────┘
         ▼
    ┌──────────────────┐
    │   Repositories   │  <- Persistencia en memoria / JSON
    └──────────────────┘
```

### 1. Dominio (`src/domain/entities/`)
- Contiene entidades ricas: `Usuario`, `Evento`, `TipoEntrada`, `Compra`, `Reseña`, `MensajeChat`.
- **Regla no negociable:** No tiene dependencias de Express, bases de datos ni bibliotecas de transporte.

### 2. Servicios (`src/services/`)
- Implementa los casos de uso: creación de compras, validación de cupos atómicos, cálculo de comisiones, envío de mensajes.
- **DTOs de salida (`mappers.js`):** La capa de servicios nunca devuelve entidades crudas hacia el controlador; mapea a DTOs limpios para evitar exponer contraseñas, emails privados o campos internos.

### 3. Controladores (`src/controllers/`)
- Recibe peticiones HTTP (`req`, `res`, `next`).
- **Validación con Zod:** Cada endpoint valida estrictamente el `body` o `query` contra un esquema Zod antes de invocar a los servicios. Si falla la validación, responde HTTP 400 mediante `RequestValidationError`.

### 4. Repositorios (`src/repositories/`)
- Abstrae el acceso y almacenamiento de datos (actualmente en memoria y respaldado por seeders).
- Provee métodos atómicos: `findById`, `save`, `updateStock`, `delete`.

---

## 📱 Arquitectura del Frontend (React Native + Expo)

- **Separación de responsabilidades:** Las pantallas (`screens/`) no hacen llamados HTTP directos; utilizan el servicio `apiService.js` a través del contexto reactivo `AppContext.js`.
- **Sistema de Tokens:** Colores, radios, tipografías y espaciados viven centralizados en `src/constants/theme.js` para garantizar consistencia visual idéntica a los mockups.
- **Manejo de Estados de UI:** Toda pantalla debe gestionar explícitamente:
  - Estado de carga (`LoadingSpinner`)
  - Estado vacío (`EmptyState`)
  - Estado de error (`ErrorMessage`)
  - Estado exitoso con datos actualizados.
