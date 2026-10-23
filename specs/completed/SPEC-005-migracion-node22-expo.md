# [SPEC-005] Migración del Entorno de Desarrollo a Node.js 22 (LTS) y Actualización de Expo

## 1. Intención
Estandarizar el runtime de desarrollo del monorepo en Node.js 22 LTS mediante la adopción de NVM (Node Version Manager) y la creación del archivo canónico `.nvmrc`, permitiendo la actualización controlada de las dependencias de Expo en el Frontend móvil (`packages/frontend`) para compatibilidad nativa con dispositivos móviles recientes (incluyendo iOS Expo Go), preservando al 100% la integridad de las reglas de negocio del Backend, la arquitectura en capas y la suite completa de pruebas automatizadas con cero regresiones.

---

## 2. Escenarios de Aceptación (BDD)

### Escenario 1: Cambio de versión con NVM (`nvm use`) y verificación de Node 22 en terminal
* **Dado** una estación de trabajo de desarrollo con NVM for Windows configurado y el archivo `.nvmrc` en la raíz del proyecto,
* **Cuando** el desarrollador o evaluador ejecuta `nvm use` (o `nvm use 22`),
* **Entonces** la terminal activa la versión Node.js 22.x LTS y la ejecución de `node -v` devuelve una versión `v22.x.x` con npm compatible (`>=10.x`).

### Escenario 2: Ejecución exitosa del backend en Node 22 con sus tests pasando sin errores
* **Dado** el paquete `packages/backend` ejecutándose bajo el runtime Node.js 22,
* **Cuando** se ejecuta la suite de pruebas automatizadas del backend (`npm run test:backend`),
* **Entonces** los controladores Zod, servicios con mappers DTOs, repositorios y las 4 entidades de dominio se ejecutan con código de salida 0 y el 100% de los tests pasando sin fallos ni advertencias de deprecación.

### Escenario 3: Actualización y alineación de dependencias de Expo en el frontend
* **Dado** el paquete `packages/frontend` y la compatibilidad requerida por la versión reciente de Expo Go en iOS/Android,
* **Cuando** se actualiza el SDK de Expo y se alinean las dependencias mediante `npx expo install --fix`,
* **Entonces** las librerías nativas (`react-native`, `react-native-safe-area-context`, `react-native-screens`, `@expo/metro-runtime`) se resuelven en versiones compatibles sin conflictos de dependencias de pares (`ERESOLVE`), compilando correctamente el bundle de Metro tanto en Web como en Native.

### Escenario 4: Verificación integral con el oráculo de pruebas (`npm test`)
* **Dado** el monorepo completo con Node 22 y las dependencias actualizadas,
* **Cuando** se ejecuta el comando oráculo `npm test`,
* **Entonces** se ejecutan secuencialmente `test:backend` y `test:frontend`, reportando 0 fallos, 0 tests cancelados y finalizando con código de salida 0.

---

## 3. Requisitos Verificables
- [x] Crear el archivo `.nvmrc` en la raíz del monorepo fijando la versión `22`.
- [x] Actualizar el campo `engines` en los `package.json` de la raíz, `packages/backend` y `packages/frontend` para reflejar soporte `node: ">=20.0.0 <=22.x.x"`.
- [x] Proporcionar guía de instalación y uso de NVM for Windows en `docs/architecture.md` y `README.md`.
- [x] Configurar scripts universales `node --test` compatibles con Node 20 y Node 22 en todos los paquetes.
- [x] Verificar que `packages/frontend/babel.config.cjs` y `metro` empaqueten sin errores para Web y Native.
- [x] Preservar intactos los 12 casos de uso del TP, las pantallas y los contratos con `apiService.js`.
- [x] Validar que la suite de pruebas completa (`npm test`) finalice con 100% de éxito (96 tests pasando).

---

## 4. Criterios de Aceptación Medibles
* Comando `node -v` devuelve `v22.x.x` (v22.23.4 verificado).
* Comando `npm run test:backend` finaliza con código de salida 0 y 55/55 tests pasando.
* Comando `npm run test:frontend` finaliza con código de salida 0 y 41/41 tests pasando.
* Comando `npm test` finaliza con código de salida 0 y 96/96 tests pasando (0 fallos, 0 errores).
* Metro Bundler (`npm run start:frontend`) compila exitosamente los módulos sin errores de sintaxis ni `ReferenceError`.
