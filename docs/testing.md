# Estrategia de Pruebas y Validación - AI Ticket It

Este documento define los oráculos de verificación y comandos para que cualquier agente o desarrollador valide cambios con evidencia empírica.

---

## 🧪 Suite de Pruebas Automatizadas

El monorepo cuenta con **96 tests automatizados** compatibles con Node 20 LTS y Node 22 LTS (gestionado vía `.nvmrc`):
- **Backend:** 55 tests (unitarios de dominio, lógica de servicios, helpers de validación Zod y endpoints).
- **Frontend:** 41 tests (lógica de estado en `apiService.test.js`, tokens en `componentsAndTokens.test.js` y arquitectura de hooks en `hooks.test.js`).

---

## ⚡ Comandos de Ejecución

Desde la raíz del monorepo (`2026-2c-lu-sa-Ramos-Facundo`):

```bash
# Correr TODOS los tests del monorepo (96 tests):
npm test

# Correr solo los tests del Backend (55 tests):
npm run test:backend

# Correr solo los tests del Frontend (41 tests):
npm run test:frontend
```

---

## 🛡️ Criterios de Aceptación para Agentes (Definition of Done)

Antes de considerar una tarea completada, el agente debe:
1. **Ejecutar `npm test`** y confirmar que los 96 tests pasen al 100% (0 fallos).
2. Si se agrega una nueva funcionalidad o endpoint:
   - Crear el test unitario correspondiente en `packages/backend/tests/` o `packages/frontend/tests/`.
   - Validar que el schema Zod rechace datos inválidos con código de error HTTP 400.
3. No aceptar soluciones basadas únicamente en la opinión del modelo; siempre aportar la salida del runner de tests como evidencia.
