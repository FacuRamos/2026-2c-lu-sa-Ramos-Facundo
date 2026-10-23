# [SPEC-003] Especificación y Auditoría de los 12 Casos de Uso del Trabajo Práctico

## 1. Intención
Formalizar la especificación canónica, los contratos de aceptación y la auditoría de cobertura de los 12 casos de uso obligatorios de la plataforma **AI Ticket It** (UTN - Diseño y Desarrollo de Software). 
Asegura que tanto la capa de Backend (Clean Architecture, controladores con validación Zod, servicios con mappers DTO y entidades de dominio) como la aplicación móvil en React Native (Expo) cumplan estrictamente las reglas de negocio, con validación automatizada verificable en cada punto.

---

## 2. Escenarios de Aceptación (BDD)

### CU-01: Visualización de compras con cuenta regresiva de días faltantes
* **Dado** un comprador con una compra en estado `CONFIRMADA` para un evento con fecha en el futuro (ej. dentro de 15 días),
* **Cuando** el usuario consulta sus compras o el detalle de una compra específica,
* **Entonces** el sistema responde con el objeto de compra indicando `diasFaltantesParaEvento: 15` y la interfaz móvil renderiza la tarjeta con la cuenta regresiva visible y el badge pastel de estado `CONFIRMADA`.

### CU-02: Panel del organizador con compras por evento y stock disponible
* **Dado** un organizador autenticado con eventos activos que poseen tipos de entrada con cupo asignado,
* **Cuando** accede a su panel de gestión o consulta las compras del evento,
* **Entonces** el sistema calcula la disponibilidad en tiempo real (`cupoTotal`, `cupoDisponible`, `vendidas`) y el listado de transacciones asociadas sin exponer datos confidenciales de los compradores.

### CU-03: Búsqueda textual y filtrado por categorías
* **Dado** un catálogo de eventos publicados pertenecientes a distintas categorías,
* **Cuando** el comprador ingresa un texto de búsqueda (nombre, descripción) y/o selecciona una categoría (ej. "Música"),
* **Entonces** el sistema filtra los eventos devolviendo únicamente las coincidencias y la interfaz actualiza los resultados en tiempo real sin recargar la pantalla.

### CU-04: Creación de eventos con tipos de entrada dinámicos
* **Dado** un organizador completando el formulario de creación de eventos,
* **Cuando** añade múltiples tipos de entrada (ej. "Campo General" $15.000 cupo 100, "Platea VIP" $35.000 cupo 30) y envía la petición con datos válidos,
* **Entonces** el controlador valida la estructura mediante Zod, la entidad crea los tipos de entrada garantizando nombres únicos y el evento queda persistido en estado activo.

### CU-05: Mensajería de compra por parte del comprador
* **Dado** un comprador titular de una compra confirmada,
* **Cuando** envía un mensaje a través del chat de la compra,
* **Entonces** el sistema verifica la autoría, agrega el mensaje con timestamp en la compra y lo retorna formateado mediante `mapMensajeDto`.

### CU-06: Respuesta a mensajes por parte del organizador
* **Dado** el organizador del evento asociado a una compra,
* **Cuando** responde un mensaje desde su bandeja de entrada o vista de conversación,
* **Entonces** el sistema valida que el emisor sea el organizador del evento y registra la respuesta en el hilo bidireccional de la compra.

### CU-07: Cancelación de compra y reembolso de cupo
* **Dado** una compra en estado `CONFIRMADA` de 3 entradas para un evento futuro,
* **Cuando** el comprador solicita la cancelación antes de la fecha límite,
* **Entonces** el estado pasa a `CANCELADA` (o `REEMBOLSADA`), se registra la transición en el historial de estados y se restituyen los 3 cupos a la disponibilidad del evento.

### CU-08: Restricción de cancelación: prohibido si está UTILIZADA o evento pasado
* **Dado** una compra en estado `UTILIZADA` o de un evento cuya fecha ya se realizó,
* **Cuando** se intenta solicitar la cancelación,
* **Entonces** el dominio arroja `InvalidStateTransitionError`, la API responde HTTP 409/400 y el cupo del evento no sufre modificaciones.

### CU-09: Calificación (1-5 estrellas) y comentario solo con compra UTILIZADA
* **Dado** un comprador que asistió al evento y posee una compra en estado `UTILIZADA`,
* **Cuando** envía una calificación con puntuación numérica entre 1 y 5 y un comentario de reseña,
* **Entonces** el sistema registra la reseña, impidiendo duplicados del mismo comprador para ese evento. Si la compra estuviera en estado `CONFIRMADA` o `CANCELADA`, la operación es rechazada con error de negocio.

### CU-10: Visualización de reputación y reseñas del organizador en los eventos
* **Dado** un evento publicado cuyo organizador ha recibido calificaciones previas en sus eventos,
* **Cuando** un usuario visualiza el detalle del evento,
* **Entonces** la respuesta incluye el `puntajeOrganizador` calculado como el promedio ponderado de sus reseñas históricas, junto al listado de opiniones de asistentes.

### CU-11: Ordenamiento por precio (asc/desc), fecha y mejor puntaje
* **Dado** un listado de eventos con diferentes rangos de precio, fechas y reputación de organizador,
* **Cuando** el usuario selecciona un criterio de ordenamiento (`precio asc`, `precio desc`, `fecha asc`, `puntajeOrganizador`),
* **Entonces** la función de dominio `ordenarEventos` reordena la colección respetando estrictamente el criterio seleccionado y el factor de dirección.

### CU-12: Compra de entradas con validación estricta de cupo y rechazo de sobreventa
* **Dado** un tipo de entrada con un cupo disponible de 2 unidades,
* **Cuando** un usuario solicita adquirir 3 unidades,
* **Entonces** el dominio arroja `InsufficientCapacityError`, el controlador responde HTTP 400 y la disponibilidad permanece inalterada en 2. Si la solicitud es por 2 o menos, la compra se confirma y el cupo se descuenta de forma atómica.

---

## 3. Requisitos Verificables
- [x] **CU-01:** Cálculo de días restantes en dominio y visualización en tarjetas de compra del cliente móvil.
- [x] **CU-02:** Disponibilidad discriminada por tipo de entrada y lista de compradores accesible para el organizador.
- [x] **CU-03:** Filtrado por texto (nombre, descripción, categoría) y píldoras interactivas en HomeScreen y SearchScreen.
- [x] **CU-04:** Configuración dinámica de múltiples tipos de entrada con cupo y precio en CreateEventScreen.
- [x] **CU-05:** Interfaz de chat con burbujas diferenciadas y persistencia de mensajes por el comprador.
- [x] **CU-06:** Bandeja de mensajes del organizador con capacidad de respuesta en el mismo canal.
- [x] **CU-07:** Cancelación con restitución atómica de cupos y registro del cambio de estado.
- [x] **CU-08:** Bloqueo estricto de cancelación ante compras utilizadas o eventos pasados.
- [x] **CU-09:** Regla de negocio de reseña vinculada exclusivamente a compras con estado `UTILIZADA`.
- [x] **CU-10:** Cálculo de promedio de reputación y visualización en el detalle del evento.
- [x] **CU-11:** Ordenamiento dinámico multicriterio en memoria y servicio.
- [x] **CU-12:** Prevención estricta de sobreventa (overselling) y consistencia transaccional de stock.

---

## 4. Criterios de Aceptación Medibles
- **100% de tests en verde:** La suite de pruebas de monorepo (`npm test`) aprueba los 79 tests (55 de backend y 24 de frontend) sin errores ni skips.
- **Validación de esquemas:** 100% de los endpoints validan con esquemas declarativos Zod antes de alcanzar la capa de servicios.
- **Aislamiento de DTOs:** 0 objetos de respuesta creados manualmente en servicios; delegación integral en `src/services/mappers.js`.
- **Fidelidad de interfaz móvil:** Componentes estilizados con tokens centralizados en `theme.js` y navegación nativa completa.
