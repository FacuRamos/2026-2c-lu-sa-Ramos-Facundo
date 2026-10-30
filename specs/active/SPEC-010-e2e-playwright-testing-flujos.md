# [SPEC-010] Pruebas E2E Automatizadas con Playwright y Grabación de Video de Flujos de Usuario

> **Metodología:** Spec-Driven Development (SDD) - Cátedra de Diseño y Desarrollo de Software (UTN)  
> **Referencia Académica:** Cátedra DDS UTN - *Sección 8: Especificaciones de Casos de Uso y Validación E2E*  
> **Estado:** Activo  
> **Dependencias:** SPEC-001 a SPEC-009 (Completadas y Aprobadas)  

---

## 1. Intención

Garantizar la calidad operativa y la integridad de la experiencia de usuario (*User Experience / UX*) de la plataforma a través de pruebas automatizadas **End-to-End (E2E)** ejecutadas sobre la versión web móvil interactiva (`http://localhost:8081`), generando de forma determinística **grabaciones de video en alta definición (.webm)** para cada flujo de usuario crítico.

El sistema de testing E2E cubre:
1. **Flujo de Autenticación y Sesión:** Validación del inicio de sesión (Comprador / Organizador), control de acceso en la navegación y cierre de sesión seguro.
2. **Exploración y Filtrado Multi-criterio:** Búsqueda reactiva, navegación por categorías y ordenamiento de catálogo por precio ascendente/descendente, fecha del evento y puntaje del organizador.
3. **Compra Multi-tipo y Pases Individuales:** Selección simultánea de múltiples tipos de entrada en una única transacción, desglose de costos y visualización de pases de acceso con código único y navegación cruzada.
4. **Comunicación Bidireccional:** Envío de mensajes del comprador desde su entrada y gestión en el inbox del organizador sin inconsistencias ni textos `undefined`.
5. **Gestión de Eventos del Organizador:** Publicación de eventos con cupos por tipo y seguimiento en el panel de ventas.

---

## 2. Escenarios de Aceptación (BDD)

### Escenario 1: Autenticación, Roles y Navegación Segura
* **Dado** que la aplicación inicia en la pantalla de bienvenida / login
* **Cuando** el usuario ingresa las credenciales de comprador (`facu@test.com` o acceso demo)
* **Entonces** la app navega a la cartelera principal (`HomeScreen`), muestra las pestañas de Comprador y permite cerrar sesión para autenticarse como Organizador.

### Escenario 2: Búsqueda, Filtrado y Ordenamiento Multi-criterio
* **Dado** un comprador navegando en la pantalla de Búsqueda
* **Cuando** aplica un filtro por categoría y selecciona ordenar por "Precio (menor a mayor)" o "Puntaje del organizador"
* **Entonces** la lista de eventos se reordena de forma inmediata respetando el criterio seleccionado y mostrando el puntaje o rango de precios correspondiente.

### Escenario 3: Compra Multi-tipo y Desglose de Entradas
* **Dado** un comprador en la pantalla de selección de entradas de un evento
* **Cuando** selecciona 2 entradas de un tipo y 1 entrada de otro tipo y confirma la compra
* **Entonces** el sistema procesa ambas adquisiciones, descuenta los cupos en el backend y permite visualizar en el Detalle de Compra los pases individuales con código de acceso e importe unitario.

### Escenario 4: Chat Interactivo entre Comprador y Organizador
* **Dado** una compra activa de un comprador
* **Cuando** el comprador pulsa "Escribir al organizador" y envía un mensaje de consulta
* **Entonces** el organizador puede ingresar a su "Chat organizador", visualizar el mensaje del comprador sin el prefijo erróneo `'Vos:'` ni textos `'undefined'`, y responder la consulta.

### Escenario 5: Grabación y Evidencia Multimedia
* **Dado** la ejecución de cualquier suite de pruebas E2E
* **Cuando** el test completa su ciclo (exitoso o con aserción)
* **Entonces** se genera automáticamente un archivo de video `.webm` en el directorio de evidencias `e2e/videos/` permitiendo auditar visualmente la interacción.

---

## 3. Requisitos Verificables

- [ ] Requisito 1: La suite de tests E2E debe ejecutarse mediante el comando estándar `npm run test:e2e`.
- [ ] Requisito 2: Cada ejecución debe generar un archivo de video `.webm` reproducible en `e2e/videos/`.
- [ ] Requisito 3: Simular una resolución de dispositivo móvil (390x844 con viewport táctil) para reflejar fielmente la UI móvil.
- [ ] Requisito 4: No alterar ni romper los 168 tests unitarios y de integración preexistentes.
- [ ] Requisito 5: Generar reporte interactivo HTML accesible con `npm run test:e2e:report`.

---

## 4. Criterios de Aceptación Medibles

* **Cobertura E2E:** 100% de los 5 flujos críticos ejecutados y verificados.
* **Evidencias en Video:** Archivos `.webm` generados para cada suite de prueba en `e2e/videos/`.
* **Regresión Cero:** 168/168 tests unitarios/backend/frontend pasando en verde.
