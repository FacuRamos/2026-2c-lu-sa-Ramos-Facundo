# AI Ticket It - Backend API (Node.js + Express)

API REST desarrollada con **Node.js** y **Express 5**, con arquitectura en capas limpia, validaciones declarativas mediante **Zod** en controladores, mapeo de DTOs en la capa de servicios y suite completa de tests automatizados con el runner nativo de Node.js.

---

## 🏗️ Arquitectura

```
packages/backend/
├── src/
│   ├── domain/
│   │   ├── entities/          # Entidades de dominio ricas (Usuario, Evento, TipoEntrada, Compra, etc.)
│   │   └── utils/             # Funciones de ordenamiento, filtros y cálculo de fechas
│   ├── controllers/           # Controladores con validación Zod en cada endpoint
│   ├── services/              # Lógica de negocio y mappers.js para DTOs de salida
│   ├── repositories/          # Repositorios en memoria y persistencia
│   ├── routes/                # Enrutador modular de Express
│   ├── middleware/            # Manejo centralizado de errores (errorHandler.js)
│   ├── data/seeders/          # Semillero inicial demo
│   └── app.js                 # Configuración de Express
├── scripts/
│   ├── seed.js                # Script CLI para sembrar la base de datos
│   └── start.js               # Entrypoint del servidor HTTP
├── tests/                     # 47 tests unitarios y de integración
├── package.json
└── postman_collection.json    # Colección Postman con ejemplos y pruebas
```

---

## ⚡ Comandos

```bash
# Instalar dependencias
npm install

# Ejecutar tests automatizados
npm test

# Sembrar datos de prueba
npm run seed

# Iniciar servidor en modo producción (puerto 3000)
npm start

# Iniciar servidor en modo desarrollo (con recarga automática)
npm run dev
```

---

## 🛡️ Principios y Reglas de Negocio
- **Validación con Zod en Controladores:** Cada controlador define sus esquemas de validación de entrada (body y query params) y arroja `RequestValidationError` si los datos no cumplen el formato esperado, respondiendo con HTTP 400.
- **DTOs de Salida en Mappers:** Para evitar exposición de datos sensibles (contraseñas, emails o favoritos de usuarios), los servicios delegan el formateo de salida en `src/services/mappers.js`.
- **Integridad de Cupos:** Las compras descuentan cupos atómicamente y las cancelaciones los devuelven.
- **Reseñas:** Solo un comprador con compra en estado `UTILIZADA` puede reseñar un evento.
- **Chat:** Solo el comprador asociado a la compra y el organizador del evento pueden enviar y leer mensajes en esa conversación.
