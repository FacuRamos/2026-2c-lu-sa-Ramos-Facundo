# [SPEC-001] Compra de Entradas y Descuento Atómico de Cupos

## 1. Intención
Permitir que un comprador registrado pueda seleccionar entradas de diferentes tipos para un evento publicado y concretar la compra, garantizando que los cupos se descuenten en tiempo real y no se produzca sobreventa (overselling).

---

## 2. Escenarios de Aceptación (BDD)

### Escenario 1: Compra exitosa con stock suficiente
* **Dado** un evento con un tipo de entrada "Campo General" con 50 cupos disponibles,
* **Cuando** el comprador solicita adquirir 2 entradas y confirma la compra,
* **Entonces** se genera una compra en estado `CONFIRMADA`, se reduce el stock a 48 cupos y se calcula el total correcto de la transacción.

### Escenario 2: Intento de compra superando el cupo disponible
* **Dado** un tipo de entrada con solo 1 cupo restante,
* **Cuando** el comprador solicita adquirir 3 entradas,
* **Entonces** el sistema rechaza la transacción con HTTP 400 (`Bad Request`), no se emite ninguna orden y el cupo permanece en 1.

### Escenario 3: Cancelación de compra y restitución de stock
* **Dado** una compra en estado `CONFIRMADA` por 2 entradas,
* **Cuando** el comprador cancela la compra antes de la fecha límite,
* **Entonces** el estado pasa a `CANCELADA` y los 2 cupos se restituyen inmediatamente a la disponibilidad del evento.

---

## 3. Requisitos Verificables
- [x] El endpoint `POST /api/purchases` valida el payload con schema Zod (`eventoId`, `entradas: [{ tipoEntradaId, cantidad }]`).
- [x] La actualización de cupos se realiza de forma atómica en el repositorio.
- [x] La respuesta de la API formatea la compra con el mapper DTO sin exponer campos internos sensibles.
- [x] La interfaz móvil muestra el desglose del total y deshabilita el selector si el cupo es 0.

---

## 4. Criterios de Aceptación Medibles
- Los tests unitarios y de integración de compras en `packages/backend/tests/` pasan al 100%.
- El test de lógica de stock en `packages/frontend/tests/apiService.test.js` pasa al 100%.
