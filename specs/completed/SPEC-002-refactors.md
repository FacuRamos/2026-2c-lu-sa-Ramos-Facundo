# [SPEC-002] Refactorización Arquitectónica y Saneamiento de Capas en Backend

## 1. Intención
Saneamiento y desacoplamiento de la arquitectura en capas del backend (`packages/backend`) para resolver fallas de responsabilidad única (SRP), duplicación de código de validación (DRY), filtración de objetos de transferencia de datos (DTOs) en los servicios, y eliminación de archivos huérfanos sin alterar los contratos HTTP externos ni romper los tests automatizados existentes.

---

## 2. Escenarios de Aceptación (BDD)

### Escenario 1: Validación Zod centralizada y reutilizable en controladores
* **Dado** una petición HTTP entrante a cualquier endpoint con datos inválidos o faltantes,
* **Cuando** el controlador procesa la validación mediante el helper unificado `validate(schema, data, defaultMsg)`,
* **Entonces** arroja un error uniforme `RequestValidationError` y el middleware de errores responde con código HTTP 400 y el detalle estructurado de los campos erróneos.

### Escenario 2: Desacoplamiento total de DTOs en la capa de servicios
* **Dado** una operación de consulta en `CompraService`, `EventoService` o `ReseniaService`,
* **Cuando** el servicio finaliza el caso de uso y prepara la salida para el controlador,
* **Entonces** la respuesta delega el 100% de la construcción de objetos y formateo a funciones en `src/services/mappers.js` sin crear objetos de presentación inline.

### Escenario 3: Respeto de fronteras de agregados en el dominio (DDD)
* **Dado** una compra confirmada con entradas asociadas a un evento,
* **Cuando** se solicita la cancelación de la compra o la calificación del evento,
* **Entonces** la restitución de cupos y las validaciones de elegibilidad se ejecutan respetando la encapsulación de las entidades y agregados sin mutaciones colaterales descontroladas.

### Escenario 4: Eliminación de código muerto y consistencia de esquemas
* **Dado** el árbol de código fuente del backend,
* **Cuando** se analizan las importaciones y dependencias del proyecto,
* **Entonces** no existen archivos ni carpetas huérfanas (`src/schemas/`) y la única fuente de verdad para validación de entrada reside en los controladores.

### Escenario 5: Manejo limpio de ruteo de infraestructura
* **Dado** el enrutador principal de la API (`src/routes/index.js`),
* **Cuando** se recibe una petición para reiniciar los datos de prueba (`POST /api/seed`),
* **Entonces** la petición es procesada a través de un controlador dedicado sin anidar lógica de ejecución inline dentro de la definición de rutas.

---

## 3. Requisitos Verificables
- [x] Eliminar los archivos huérfanos de `src/schemas/` (`categoriaSchema.js`, `compraSchema.js`, `eventoSchema.js`, `reseniaSchema.js`, `usuarioSchema.js`, `index.js`).
- [x] Crear el helper reutilizable `src/controllers/utils/validate.js` y reemplazar las implementaciones duplicadas en los 5 controladores.
- [x] Incorporar en `src/services/mappers.js` los mappers faltantes (`mapMensajeDto`, `mapDisponibilidadTipoDto`, `mapComprasPorEventoDto`, `mapResumenOrganizadorReseniasDto`, `mapEventoConDetalleYReseniasDto`) y desacoplar los servicios de la construcción manual de objetos.
- [x] Añadir getters y métodos de acceso limpio en entidades (`compradorId`, `eventoId`, `tipoEntradaId`) y en `Evento` (`restituirCupo(tipoEntradaId, cantidad)`).
- [x] Delegar la verificación de habilitación de reseña hacia `Compra.puedeSerReseniadaPor(compradorId, eventoId)` manteniendo compatibilidad hacia atrás en `Resenia.validarCompraHabilitaResenia`.
- [x] Extraer el handler de `POST /api/seed` en un controlador dedicado (`SeedController.js`).

---

## 4. Criterios de Aceptación Medibles
- Los 79 tests automatizados (`npm test`) pasan al 100% (55 tests de backend y 24 tests de frontend).
- 0 advertencias o errores en la carga de módulos de Express.
- 0 referencias residuales a la carpeta huérfana `src/schemas/`.
- La colección Postman continúa funcionando con compatibilidad total en todas sus peticiones.
