# [SPEC-006] Integración y Alineación de Vistas UI/UX para Frontend Móvil

## 1. Intención
Trasladar fielmente el diseño visual y la experiencia de usuario del prototipo (`diseno-ui-ux-ai-ticket-it.zip` / `ai-ticket-it-prototype.tsx`) a la aplicación móvil en React Native (`packages/frontend`), asegurando cobertura integral, intuitiva y robusta de los 12 Casos de Uso oficiales de la cátedra de Diseño y Desarrollo de Software (UTN), tanto para el rol de Comprador como para el de Organizador, preservando la arquitectura limpia, los tokens de diseño centralizados y el 100% de los tests automatizados en verde.

---

## 2. Escenarios de Aceptación (BDD)

### CU-01: Vista de "Mis Compras" con badges de estado y cuenta regresiva
* **Dado** un comprador con compras registradas en diferentes estados (`CONFIRMADA`, `UTILIZADA`, `CANCELADA`),
* **Cuando** navega a la pantalla "Mis Compras" o ingresa al "Detalle de compra",
* **Entonces** cada tarjeta renderiza el badge de estado con su respectivo tono pastel (`#DCE9DE` confirmada, `#EAECE8` utilizada, `#F0DEDA` cancelada) y, si la compra está confirmada con fecha futura, exhibe en verde el texto `Faltan X días para el evento`.

### CU-02: Vista de "Gestión de Evento / Ventas" del organizador con stock y compras por tipo
* **Dado** un organizador visualizando la pantalla de "Gestionar evento",
* **Cuando** inspecciona las métricas del evento seleccionado,
* **Entonces** visualiza las tarjetas de métricas (`Vendidas`, `Disponibles`, `Ingresos`), las barras de progreso de disponibilidad por tipo de entrada con porcentaje de ocupación, el acceso directo a la lista de compradores (`Compras del evento`) y el panel de transición interactiva de estados de compra.

### CU-03: Vista de "Explorar / Búsqueda" con barra de texto y selector por categorías
* **Dado** un usuario en la pantalla de "Inicio" o "Buscar eventos",
* **Cuando** escribe un texto en la barra de búsqueda o presiona una píldora de categoría ("Todos", "Música", "Teatro", "Deportes"),
* **Entonces** la lista de eventos se actualiza reactivamente filtrando coincidencias por nombre, descripción o categoría, mostrando el contador de resultados coincidentes.

### CU-04: Formulario de "Crear Evento" con agregado dinámico de tipos de entrada
* **Dado** un organizador en el formulario "Crear evento",
* **Cuando** presiona "+ Agregar tipo" e ingresa el nombre, precio y cupo para múltiples tipos de entrada (ej. General, Platea, VIP),
* **Entonces** el formulario valida que cada entrada tenga valores positivos y nombres no vacíos, permitiendo publicar el evento completo con todas sus modalidades de ticket.

### CU-05: Vista de "Chat de Compra" por parte del comprador
* **Dado** un comprador con una compra confirmada accediendo al chat de la misma,
* **Cuando** escribe una consulta en la barra inferior y presiona el botón de envío,
* **Entonces** el mensaje se agrega en una burbuja alineada a la derecha con fondo destacado, actualizando la conversación y quedando registrado en el backend.

### CU-06: Vista de "Chat Organizador / Inbox" para respuesta bidireccional
* **Dado** un organizador en su bandeja de mensajes recibidos,
* **Cuando** selecciona la conversación de un comprador y envía una respuesta,
* **Entonces** el mensaje se visualiza alineado a la derecha en su vista y aparece instantáneamente a la izquierda (burbuja gris) en la pantalla del comprador respectivo.

### CU-07: Botón y modal de confirmación de "Cancelar Compra"
* **Dado** un comprador con una compra `CONFIRMADA` de un evento futuro en "Detalle de compra",
* **Cuando** presiona el botón "Cancelar compra" y confirma la acción en el diálogo de confirmación,
* **Entonces** el sistema actualiza el estado a `CANCELADA`, cambia el badge visual a rojo pastel, oculta la cuenta regresiva y restituye los cupos al inventario disponible.

### CU-08: Bloqueo estricto de cancelación en compras utilizadas o eventos pasados
* **Dado** una compra en estado `UTILIZADA` o correspondiente a un evento cuya fecha ya ocurrió,
* **Cuando** el usuario visualiza el "Detalle de compra",
* **Entonces** el botón "Cancelar compra" no se encuentra visible ni disponible, impidiendo cancelaciones inválidas conforme a las reglas del dominio.

### CU-09: Modal/Pantalla de "Calificar Evento" habilitado exclusivamente en compras UTILIZADAS
* **Dado** un comprador con una compra en estado `UTILIZADA`,
* **Cuando** ingresa a "Calificar evento", selecciona de 1 a 5 estrellas y redacta un comentario sobre su experiencia,
* **Entonces** el sistema registra la reseña, actualiza el promedio de reputación del organizador y previene que un comprador califique compras en estado `CONFIRMADA` o `CANCELADA`.

### CU-10: Tarjeta y sección de "Reseñas del Organizador" en detalle del evento
* **Dado** un usuario navegando el "Detalle del evento",
* **Cuando** hace scroll hasta la sección del organizador y opiniones,
* **Entonces** visualiza la tarjeta del organizador con su avatar distintivo y puntaje promedio histórico (ej. `4.9 ★`), junto al bloque de reseñas de asistentes con estrellas y comentarios reales.

### CU-11: Controles de ordenamiento en la búsqueda
* **Dado** un comprador visualizando los resultados en "Buscar eventos",
* **Cuando** pulsa el botón "Ordenar" y selecciona uno de los 5 criterios (Precio: Menor a Mayor, Precio: Mayor a Menor, Fecha más próxima, Mejor puntuación del organizador),
* **Entonces** la colección de tarjetas se reordena inmediatamente en pantalla reflejando el criterio activo.

### CU-12: Pantalla de "Selección de Entradas" con desglose de total y bloqueo por cupo agotado
* **Dado** un comprador en "Comprar entradas",
* **Cuando** incrementa o decrementa la cantidad de entradas mediante los controles `[-]` y `[+]`,
* **Entonces** el cuadro de resumen actualiza en tiempo real el desglose de subtotal y total a abonar. Si un tipo de entrada tiene cupo agotado (`cupoDisponible === 0`), el control queda deshabilitado indicando "Agotado".

---

## 3. Requisitos Verificables
- [x] **Pantallas Comprador (`src/screens/buyer/`):**
  - [x] `HomeScreen`: Saludo personalizado, barra de búsqueda accesible, selector de categorías horizontal, carrusel de destacados y lista vertical "Para vos" con cards compactas.
  - [x] `SearchScreen`: Input de búsqueda en vivo, botón de ordenamiento con modal de selección, contador de resultados y listado filtrado.
  - [x] `EventDetailScreen`: Hero con imagen y superposición de botones volver/favorito, chip de categoría, título, estrellas, grid de fecha/lugar, card de organizador con avatar y calificación, selector de entradas y bloque de reseñas.
  - [x] `TicketSelectionScreen`: Cabecera resumen del evento, filas de tipos de entrada con selector de cantidad `- qty +`, tarjeta resumen con subtotal, total y aviso de seguridad/garantía de pago.
  - [x] `PurchasesScreen`: Pestañas "Todas", "Próximas" y "Pasadas", tarjetas de compra con badge de estado y contador de días o CTA de calificación.
  - [x] `PurchaseDetailScreen`: Banner con gradiente y badge, grid de fecha/lugar, desglose del pedido, banner verde de días faltantes, botón principal "Escribir al organizador" y botón secundario "Cancelar compra".
  - [x] `ChatScreen`: Hilo de conversación con burbujas diferenciadas por rol (comprador/organizador), separador de fecha "Hoy" e input con botón circular de envío.
  - [x] `ReviewScreen`: Banner del evento, selector interactivo de 1 a 5 estrellas doradas, campo multilínea para la experiencia y lista de reseñas previas de la comunidad.

- [x] **Pantallas Organizador (`src/screens/organizer/`):**
  - [x] `OrganizerDashboardScreen`: Saludo al organizador, métricas clave (Eventos publicados, Entradas vendidas, Ingresos), botón "+ Crear nuevo evento", listado de mis eventos con tickets vendidos y banner de crecimiento.
  - [x] `CreateEventScreen`: Formulario con nombre, descripción, selector de categoría, fecha, ubicación y editor dinámico de tipos de entrada (nombre, precio, cupo) con validaciones completas.
  - [x] `ManageEventScreen`: Header con acciones rápidas, métricas del evento (Vendidas, Disponibles, Ingresos), barras de disponibilidad de cupo con progreso porcentual y tarjeta interactiva de transición de estados de compra.
  - [x] `OrganizerSalesScreen`: Barra de resumen de ventas y cupos libres, pestañas de filtro por estado y tarjetas de compra con iniciales del comprador, tipo de entrada y precio total.
  - [x] `OrganizerInboxScreen`: Bandeja de mensajes con avatares de compradores, último mensaje y navegación directa a la conversación bidireccional.

- [x] **Alineación con Sistema de Diseño y Tokens (`src/constants/theme.js`):**
  - [x] Paleta cromática idéntica al prototipo (`#F4F2EE`, `#46717A`, `#353735`, `#85847E`, `#DCE9DE`, `#F1E8D5`, `#F0DEDA`, `#D8B66F`).
  - [x] Tipografías, bordes redondeados (`RADIUS`), sombras sutiles y espaciados armonizados.

---

## 4. Criterios de Aceptación Medibles
* **100% Casos de Uso Cubiertos:** Los 12 casos de uso del Trabajo Práctico están implementados, enlazados en el árbol de navegación y accesibles desde la interfaz móvil.
* **100% Tests en Verde:** La suite de pruebas de monorepo (`npm test`) aprueba el 100% de los tests unitarios y de arquitectura (102 tests: 55 de backend y 47 de frontend) con 0 fallas y código de salida 0.
* **Fidelidad al Prototipo:** Todos los componentes visuales respetan la disposición, iconos, tipografía y estilo estético del prototipo `components/ai-ticket-it-prototype.tsx`.
