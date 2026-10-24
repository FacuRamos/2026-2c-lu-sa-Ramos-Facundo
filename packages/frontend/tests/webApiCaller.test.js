import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

import {
  webApiCaller,
  WebApiCaller,
  setBaseUrl,
  resetBaseUrl,
  getBaseUrl,
  resolveBaseUrl,
  DEFAULT_TIMEOUT,
  ApiError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  NetworkError,
  createApiErrorFromResponse,
  eventsService,
  purchasesService,
  chatService,
  reviewsService,
  organizerService,
  authService,
  notificationsService,
} from '../src/services/api/index.js';
import { apiService } from '../src/services/apiService.js';

test('SPEC-008: WebApiCaller & Modular Architecture Suite', async (t) => {
  await t.test('Client Configuration & Base URL Resolution', () => {
    assert.strictEqual(DEFAULT_TIMEOUT, 8000);

    const originalUrl = getBaseUrl();
    assert.ok(originalUrl.includes('3000') || originalUrl.includes('api'));

    setBaseUrl('http://192.168.1.50:4000/api');
    assert.strictEqual(getBaseUrl(), 'http://192.168.1.50:4000/api');

    resetBaseUrl();
    assert.strictEqual(getBaseUrl(), resolveBaseUrl());
  });

  await t.test('ApiError Hierarchy & Zod Error Transformation', () => {
    // 400 con array Zod issues
    const zodError = createApiErrorFromResponse(400, {
      error: 'Validation failed',
      details: [{ message: 'El nombre es obligatorio' }, { message: 'El precio debe ser positivo' }],
    });
    assert.ok(zodError instanceof ValidationError);
    assert.strictEqual(zodError.status, 400);
    assert.strictEqual(zodError.message, 'El nombre es obligatorio, El precio debe ser positivo');

    // 401 Unauthorized
    const unauthError = createApiErrorFromResponse(401, { error: 'Token expirado o ausente' });
    assert.ok(unauthError instanceof UnauthorizedError);
    assert.strictEqual(unauthError.status, 401);
    assert.strictEqual(unauthError.message, 'Token expirado o ausente');

    // 403 Forbidden
    const forbiddenError = createApiErrorFromResponse(403, { message: 'Acceso no permitido para este rol' });
    assert.ok(forbiddenError instanceof ForbiddenError);
    assert.strictEqual(forbiddenError.status, 403);

    // 404 Not Found
    const notFoundError = createApiErrorFromResponse(404, { message: 'Evento no encontrado' });
    assert.ok(notFoundError instanceof NotFoundError);
    assert.strictEqual(notFoundError.status, 404);

    // 409 Conflict
    const conflictError = createApiErrorFromResponse(409, { message: 'Email duplicado' });
    assert.ok(conflictError instanceof ConflictError);
    assert.strictEqual(conflictError.status, 409);

    // 500 General Server Error
    const serverError = createApiErrorFromResponse(500, { error: 'Error interno en Base de Datos' });
    assert.ok(serverError instanceof ApiError);
    assert.strictEqual(serverError.status, 500);

    // Network / Timeout Error
    const netError = new NetworkError('Conexión rechazada');
    assert.strictEqual(netError.status, 0);
  });

  await t.test('HTTP Operations (GET, POST, PUT, PATCH, DELETE, UPDATE) via Live Server', async (st) => {
    // Servidor mock ephemeral en Node puro para validar llamadas HTTP reales de WebApiCaller
    let receivedMethod = null;
    let receivedUrl = null;
    let receivedBody = null;
    let mockResponseStatus = 200;
    let mockResponseBody = { success: true };
    let delayMs = 0;

    const server = http.createServer((req, res) => {
      receivedMethod = req.method;
      receivedUrl = req.url;

      let bodyData = '';
      req.on('data', (chunk) => {
        bodyData += chunk;
      });

      req.on('end', () => {
        if (bodyData) {
          try {
            receivedBody = JSON.parse(bodyData);
          } catch {
            receivedBody = bodyData;
          }
        } else {
          receivedBody = null;
        }

        setTimeout(() => {
          res.writeHead(mockResponseStatus, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(mockResponseBody));
        }, delayMs);
      });
    });

    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const testBaseUrl = `http://127.0.0.1:${port}/api`;
    setBaseUrl(testBaseUrl);

    try {
      await st.test('GET ejecuta con query parameters y serializa DTO de respuesta', async () => {
        mockResponseStatus = 200;
        mockResponseBody = [{ id: 'ev-1', nombre: 'Recital Rock' }];

        const data = await webApiCaller.get('/eventos', {
          query: { q: 'Rock', categoriaId: 'cat-musica' },
        });

        assert.strictEqual(receivedMethod, 'GET');
        assert.ok(receivedUrl.includes('/api/eventos'));
        assert.ok(receivedUrl.includes('q=Rock'));
        assert.ok(receivedUrl.includes('categoriaId=cat-musica'));
        assert.deepStrictEqual(data, [{ id: 'ev-1', nombre: 'Recital Rock' }]);
      });

      await st.test('POST envía payload JSON y retorna status 201', async () => {
        mockResponseStatus = 201;
        mockResponseBody = { id: 'cmp-100', estado: 'CONFIRMADA' };

        const payload = { eventoId: 'ev-1', cantidad: 2 };
        const data = await webApiCaller.post('/compras', payload);

        assert.strictEqual(receivedMethod, 'POST');
        assert.strictEqual(receivedUrl, '/api/compras');
        assert.deepStrictEqual(receivedBody, payload);
        assert.strictEqual(data.estado, 'CONFIRMADA');
      });

      await st.test('PATCH y update() alias ejecutan peticiones parciales', async () => {
        mockResponseStatus = 200;
        mockResponseBody = { id: 'cmp-100', estado: 'CANCELADA' };

        const resPatch = await webApiCaller.patch('/compras/cmp-100/cancelar', { motivo: 'test' });
        assert.strictEqual(receivedMethod, 'PATCH');
        assert.strictEqual(resPatch.estado, 'CANCELADA');

        // Test del alias update
        const resUpdate = await webApiCaller.update('/compras/cmp-100/cancelar', { motivo: 'test' });
        assert.strictEqual(receivedMethod, 'PATCH');
        assert.strictEqual(resUpdate.estado, 'CANCELADA');
      });

      await st.test('PUT actualiza entidad completa', async () => {
        mockResponseStatus = 200;
        mockResponseBody = { id: 'usr-1', nombre: 'Nuevo Nombre' };

        const data = await webApiCaller.put('/usuarios/usr-1', { nombre: 'Nuevo Nombre' });
        assert.strictEqual(receivedMethod, 'PUT');
        assert.strictEqual(data.nombre, 'Nuevo Nombre');
      });

      await st.test('DELETE elimina recurso en servidor', async () => {
        mockResponseStatus = 200;
        mockResponseBody = { deleted: true };

        const data = await webApiCaller.delete('/usuarios/usr-1/favoritos/ev-1');
        assert.strictEqual(receivedMethod, 'DELETE');
        assert.strictEqual(data.deleted, true);
      });

      await st.test('Captura error HTTP 400 de validación del backend y arroja ValidationError', async () => {
        mockResponseStatus = 400;
        mockResponseBody = {
          error: 'Error de validación en request',
          details: [{ message: 'El precio de la entrada debe ser mayor a 0' }],
        };

        await assert.rejects(
          async () => {
            await webApiCaller.post('/eventos', { nombre: 'Incompleto' });
          },
          (err) => {
            assert.ok(err instanceof ValidationError);
            assert.strictEqual(err.status, 400);
            assert.strictEqual(err.message, 'El precio de la entrada debe ser mayor a 0');
            return true;
          }
        );
      });

      await st.test('Timeout aborta petición lenta y arroja NetworkError estructurado', async () => {
        delayMs = 150;
        const quickCaller = new WebApiCaller({ timeout: 50 });

        await assert.rejects(
          async () => {
            await quickCaller.get('/endpoint-lento');
          },
          (err) => {
            assert.ok(err instanceof NetworkError);
            assert.ok(err.message.includes('Tiempo de espera agotado') || err.message.includes('timeout'));
            return true;
          }
        );
        delayMs = 0;
      });
    } finally {
      resetBaseUrl();
      await new Promise((resolve) => server.close(resolve));
    }
  });

  await t.test('Modular Domain Services Delegation & Facade Integrity', async () => {
    // Verificar que los servicios modulares están instanciados y expuestos en la fachada
    assert.ok(apiService.events === eventsService);
    assert.ok(apiService.purchases === purchasesService);
    assert.ok(apiService.chat === chatService);
    assert.ok(apiService.reviews === reviewsService);
    assert.ok(apiService.organizer === organizerService);
    assert.ok(apiService.auth === authService);
    assert.ok(apiService.notifications === notificationsService);
    assert.ok(apiService.client === webApiCaller);

    // Verificar que getEventos, getCategorias, etc. responden a través de la fachada
    const categorias = await apiService.getCategorias();
    assert.ok(Array.isArray(categorias));
    assert.ok(categorias.length >= 3);

    const eventos = await apiService.getEventos();
    assert.ok(Array.isArray(eventos));
    assert.ok(eventos.length >= 3);
  });
});
