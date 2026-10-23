# Plantilla de Especificación (Spec-Driven Development - SDD)

> Esta plantilla sigue los 4 elementos obligatorios definidos en la Sección 8 del apunte de cátedra:
> 1. Intención
> 2. Escenarios (Dado / Cuando / Entonces)
> 3. Requisitos verificables
> 4. Criterio de aceptación

---

# [SPEC-XXX] Nombre de la Funcionalidad

## 1. Intención
*¿Qué problema resuelve y para quién? (Describir el qué en términos de negocio o producto, sin acoplarse a tecnologías).*

## 2. Escenarios de Aceptación (BDD)
### Escenario 1: Flujo principal exitoso
* **Dado** [un estado inicial o precondición válida]
* **Cuando** [el usuario realiza una acción específica]
* **Entonces** [el sistema produce un resultado esperado verificable]

### Escenario 2: Flujo alternativo / Caso de error
* **Dado** [una condición inválida o caso borde]
* **Cuando** [el usuario intenta la acción]
* **Entonces** [el sistema rechaza la operación con un mensaje o error claro]

## 3. Requisitos Verificables
- [ ] Requisito 1: Condición concreta 1.
- [ ] Requisito 2: Condición concreta 2.
- [ ] Requisito 3: No romper contratos existentes.

## 4. Criterios de Aceptación Medibles
* [Métrica o validación objetiva, por ej: "Tests automatizados en verde", "Respuesta en < 200ms", "0 cupos negativos"].
