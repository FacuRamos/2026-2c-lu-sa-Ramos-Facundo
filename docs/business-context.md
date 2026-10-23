# Contexto de Negocio y Reglas del Dominio - AI Ticket It

Este documento centraliza el conocimiento tácito y las reglas de negocio de **AI Ticket It**, el sistema integral de venta de entradas para eventos.

---

## 🎭 Roles de Usuario

1. **Comprador (`buyer`):**
   - Explora eventos por categoría, fecha o búsqueda de texto.
   - Selecciona cantidades de entradas por tipo respetando el cupo disponible.
   - Realiza compras y visualiza sus tickets con cuenta regresiva.
   - Se comunica con el organizador del evento mediante un chat vinculado a su compra.
   - Puede calificar el evento con puntuación (1 a 5 estrellas) y comentario **únicamente** cuando la compra se encuentra en estado `UTILIZADA`.

2. **Organizador (`organizador`):**
   - Crea y publica eventos definiendo ubicación, fecha, descripción y múltiples tipos de entrada.
   - Monitorea métricas en su dashboard: entradas vendidas, disponibles y recaudación monetaria.
   - Visualiza el listado de compradores de sus eventos.
   - Responde mensajes de compradores a través de la bandeja de entrada del evento.

---

## 📜 Reglas de Negocio No Negociables

### 1. Gestión de Cupos y Stock
- La compra de entradas debe restar cupos en forma inmediata y atómica.
- No se puede vender una cantidad mayor al cupo disponible de un `TipoEntrada`.
- Si el cupo llega a 0, la entrada pasa a estado `Agotada` y no permite compras adicionales.
- Si una compra es cancelada por el comprador, los cupos deben ser restituidos inmediatamente al stock disponible del evento.

### 2. Ciclo de Vida de una Compra
Una compra transita por los siguientes estados:
- **`CONFIRMADA`**: Compra realizada exitosamente.
- **`PENDIENTE`**: Compra en proceso de acreditación de pago.
- **`UTILIZADA`**: Entrada escaneada/utilizada en el evento.
- **`CANCELADA`**: Compra anulada (restituye cupo).

### 3. Sistema de Calificaciones y Reseñas
- Un usuario **no** puede calificar un evento que no compró.
- Un usuario **no** puede calificar un evento si su compra está en estado `CONFIRMADA`, `PENDIENTE` o `CANCELADA`.
- **Condición obligatoria:** Solo se habilita la reseña si la compra está en estado `UTILIZADA`.

### 4. Privacidad y Alcance del Chat
- El chat siempre está anclado al par `(compraId, eventoId)`.
- Solo dos participantes tienen acceso a los mensajes:
  1. El comprador dueño de la compra.
  2. El organizador dueño del evento.
- No se permite que terceros lean o emitan mensajes en dicha conversación.
