import test from 'node:test';
import assert from 'node:assert/strict';

import { secureStoreService, SECURE_KEYS } from '../src/services/secureStoreService.js';
import { apiService } from '../src/services/apiService.js';
import { setBaseUrl, resetBaseUrl } from '../src/services/api/client/config.js';

test('SPEC-007: Frontend Auth, Secure Storage & Notification Center Tests', async (t) => {
  // Asegurar aislamiento determinista en tests unitarios frente a backends locales activos
  setBaseUrl('http://127.0.0.1:59999/api');
  t.after(() => {
    resetBaseUrl();
  });
  await t.test('Secure Store Hardware Abstraction (expo-secure-store)', async (st) => {
    await st.test('almacena y recupera strings de forma segura', async () => {
      await secureStoreService.setItem('TEST_KEY', 'jwt-super-secreto-123');
      const val = await secureStoreService.getItem('TEST_KEY');
      assert.strictEqual(val, 'jwt-super-secreto-123');
    });

    await st.test('almacena y recupera objetos parseados JSON', async () => {
      const demoUser = { id: 'usr-123', nombre: 'Martina', rol: 'Comprador' };
      await secureStoreService.setObject(SECURE_KEYS.USER_DATA, demoUser);
      const recuperado = await secureStoreService.getObject(SECURE_KEYS.USER_DATA);
      assert.deepStrictEqual(recuperado, demoUser);
    });

    await st.test('elimina items correctamente', async () => {
      await secureStoreService.setItem('KEY_TO_DELETE', 'valor');
      await secureStoreService.deleteItem('KEY_TO_DELETE');
      const res = await secureStoreService.getItem('KEY_TO_DELETE');
      assert.strictEqual(res, null);
    });
  });

  await t.test('Authentication & Registration Flows', async (st) => {
    await st.test('loginDemo retorna sesión instantánea de Martina (Comprador)', async () => {
      const res = await apiService.loginDemo('Comprador');
      assert.ok(res.token);
      assert.strictEqual(res.usuario.nombre, 'Martina');
      assert.strictEqual(res.usuario.rol, 'Comprador');
    });

    await st.test('loginDemo retorna sesión instantánea de Luna Producciones (Organizador)', async () => {
      const res = await apiService.loginDemo('Organizador');
      assert.ok(res.token);
      assert.strictEqual(res.usuario.nombreProductora, 'Luna Producciones');
      assert.strictEqual(res.usuario.rol, 'Organizador');
    });

    await st.test('registerBuyer valida campos y registra nuevo comprador', async () => {
      await assert.rejects(
        async () => {
          await apiService.registerBuyer({
            nombre: 'A',
            apellido: 'López',
            email: 'ana@test.com',
            password: '123456',
          });
        },
        /El nombre debe tener al menos 2 caracteres/
      );

      const res = await apiService.registerBuyer({
        nombre: 'Valeria',
        apellido: 'Ríos',
        email: 'valeria.rios@test.com',
        password: 'password123',
      });
      assert.strictEqual(res.usuario.nombre, 'Valeria');
      assert.strictEqual(res.usuario.rol, 'Comprador');
      assert.ok(res.token);
    });

    await st.test('registerOrganizer exige nombreProductora y no requiere CBU ni Alias', async () => {
      await assert.rejects(
        async () => {
          await apiService.registerOrganizer({
            nombre: 'Esteban',
            apellido: 'Pérez',
            nombreProductora: '',
            email: 'esteban@test.com',
            password: 'password123',
          });
        },
        /El nombre de la productora es obligatorio/
      );

      const res = await apiService.registerOrganizer({
        nombre: 'Esteban',
        apellido: 'Pérez',
        nombreProductora: 'Indie Live Fest',
        email: 'esteban@indielive.com',
        password: 'password123',
      });
      assert.strictEqual(res.usuario.nombreProductora, 'Indie Live Fest');
      assert.strictEqual(res.usuario.rol, 'Organizador');
      assert.ok(res.token);
    });
  });

  await t.test('Notification Center (Campanita & Triggers)', async (st) => {
    apiService.reset();

    await st.test('filtra notificaciones iniciales por rolDestino', async () => {
      const notifsComprador = await apiService.getNotificaciones({ rolDestino: 'Comprador' });
      assert.ok(notifsComprador.length >= 2);
      assert.ok(notifsComprador.every((n) => n.rolDestino === 'Comprador'));

      const notifsOrg = await apiService.getNotificaciones({ rolDestino: 'Organizador' });
      assert.ok(notifsOrg.length >= 2);
      assert.ok(notifsOrg.every((n) => n.rolDestino === 'Organizador'));
    });

    await st.test('calcula correctamente el contador de no leídas para el badge', async () => {
      const count = await apiService.getUnreadNotificacionesCount({ rolDestino: 'Comprador' });
      assert.ok(count > 0);
    });

    await st.test('marca una notificación como leída y actualiza estado', async () => {
      const list = await apiService.getNotificaciones({ rolDestino: 'Comprador', noLeidas: true });
      const item = list[0];
      const marcada = await apiService.marcarNotificacionLeida(item.id);
      assert.strictEqual(marcada.leida, true);
    });

    await st.test('marca todas como leídas y descuenta el contador a 0', async () => {
      await apiService.marcarTodasNotificacionesLeidas({ rolDestino: 'Organizador' });
      const count = await apiService.getUnreadNotificacionesCount({ rolDestino: 'Organizador' });
      assert.strictEqual(count, 0);
    });

    await st.test('crea disparador de notificación en tiempo real', async () => {
      const nueva = await apiService.crearNotificacion({
        usuarioId: 'usr-comprador-1',
        rolDestino: 'Comprador',
        tipo: 'COMPRA_CONFIRMADA',
        titulo: '¡Tu recital es hoy!',
        mensaje: 'Apertura de puertas a las 19:00 hs.',
      });
      assert.strictEqual(nueva.titulo, '¡Tu recital es hoy!');
      assert.strictEqual(nueva.leida, false);

      const todas = await apiService.getNotificaciones({ rolDestino: 'Comprador' });
      assert.strictEqual(todas[0].id, nueva.id);
    });
  });
});
