# AI Ticket It - AGENTS.md (Constitution e Índice del Repositorio)

Bienvenido. Este archivo es la **Constitution** y el mapa de contexto del monorepo **AI Ticket It** (Desarrollo de Software - UTN).
Sigue el principio de **divulgación progresiva**: este archivo es conciso y funciona como punto de entrada hacia la documentación profunda en `docs/` y `specs/`.

---

## 🗺️ Mapa de Documentación y Conocimiento

* 🏛️ **Arquitectura y Capas:** [docs/architecture.md](docs/architecture.md) (Clean Architecture, controladores Zod, DTOs con mappers, frontend Expo).
* 💼 **Reglas de Negocio:** [docs/business-context.md](docs/business-context.md) (Gestión atómica de cupos, ciclo de compras, reseñas en estado UTILIZADA, chat).
* 🧪 **Estrategia de Tests y Verificación:** [docs/testing.md](docs/testing.md) (Suite de 79 tests automatizados y comandos).
* 📋 **Especificaciones SDD:**
  * Especificaciones activas: `specs/active/`
  * Especificaciones completadas: `specs/completed/` (`SPEC-001`, `SPEC-002`, `SPEC-003`)

---

## ⚖️ Reglas No Negociables del Proyecto

1. **Arquitectura en Capas:**
   - En el backend, las peticiones pasan estrictamente por: `Controller (Zod)` ➔ `Service` ➔ `Domain Entity / Repository`.
   - La capa de servicios nunca expone entidades puras; siempre formatea la salida mediante DTOs en `src/services/mappers.js`.
2. **Validación de Entradas:**
   - Todo nuevo endpoint debe validar body y query params mediante esquemas declarativos **Zod** y responder HTTP 400 ante datos inválidos.
3. **Consistencia de Tokens en Frontend:**
   - No usar colores "hardcodeados" en componentes React Native. Utilizar siempre los tokens de `src/constants/theme.js`.
4. **Verificación con Evidencia (Definition of Done):**
   - Nunca dar una tarea por finalizada sin ejecutar `npm test` y verificar que los 71 tests pasen al 100%.

---

## ⚡ Comandos Rápidos del Harness

* **Ejecutar todos los tests:** `npm test`
* **Test del Backend:** `npm run test:backend`
* **Test del Frontend:** `npm run test:frontend`
* **Iniciar Backend (3000):** `npm run start:backend`
* **Iniciar Frontend (Expo):** `npm run start:frontend`
* **Sembrar Base de Datos:** `cd packages/backend && npm run seed`

---

## 🛠️ Skills Disponibles en el Repositorio

Ubicadas en `.agents/skills/`:
- `architecture-patterns`: Guía para mantener límites limpios en Clean Architecture, Hexagonal y DDD.
- `api-design-principles`: Estándares de diseño de endpoints REST y respuestas HTTP consistentes.
- `frontend-design` & `vercel-react-best-practices`: Criterios visuales y de rendimiento para React/React Native.
- `systematic-debugging`: Metodología rigurosa para aislar y resolver errores mediante evidencia.
