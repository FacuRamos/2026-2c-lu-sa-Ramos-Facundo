import test from 'node:test';
import assert from 'node:assert/strict';

import {
    registroCompradorSchema,
    registroOrganizadorSchema,
    loginSchema
} from '../src/controllers/AuthController.js';
import { AuthService } from '../src/services/AuthService.js';
import { NotificacionService } from '../src/services/NotificacionService.js';
import { UsuarioRepository } from '../src/repositories/UsuarioRepository.js';
import { NotificacionRepository } from '../src/repositories/NotificacionRepository.js';
import { TIPOS_NOTIFICACION } from '../src/domain/entities/notificacion.js';

test('SPEC-007: Auth & Notifications Subsystem Tests', async (t) => {
    await t.test('Declarative Zod Validation', async (st) => {
        await st.test('Rechaza registro de comprador con email inválido o password menor a 6 caracteres', () => {
            const invalidoEmail = registroCompradorSchema.safeParse({
                nombre: 'Ana',
                apellido: 'López',
                email: 'no-es-email',
                password: 'password123'
            });
            assert.strictEqual(invalidoEmail.success, false);

            const invalidoPass = registroCompradorSchema.safeParse({
                nombre: 'Ana',
                apellido: 'López',
                email: 'ana@example.com',
                password: '123'
            });
            assert.strictEqual(invalidoPass.success, false);
        });

        await st.test('Permite registro de comprador sin teléfono obligatorio', () => {
            const valid = registroCompradorSchema.safeParse({
                nombre: 'Martina',
                apellido: 'García',
                email: 'martina@example.com',
                password: 'password123'
            });
            assert.strictEqual(valid.success, true);
            assert.strictEqual(valid.data.rol, 'Comprador');
        });

        await st.test('Valida registro de organizador exigiendo nombreProductora y sin CBU/Alias', () => {
            const sinProductora = registroOrganizadorSchema.safeParse({
                nombre: 'Carlos',
                apellido: 'Luna',
                email: 'carlos@luna.com',
                password: 'password123'
            });
            assert.strictEqual(sinProductora.success, false);

            const conProductora = registroOrganizadorSchema.safeParse({
                nombre: 'Carlos',
                apellido: 'Luna',
                nombreProductora: 'Luna Producciones',
                email: 'carlos@luna.com',
                password: 'password123'
            });
            assert.strictEqual(conProductora.success, true);
            assert.strictEqual(conProductora.data.nombreProductora, 'Luna Producciones');
            assert.strictEqual(conProductora.data.rol, 'Organizador');
        });
    });

    await t.test('AuthService Business Rules', async (st) => {
        const repo = new UsuarioRepository();
        const auth = new AuthService({ usuarioRepo: repo });

        await st.test('Registra comprador y emite tokens JWT desacoplados', async () => {
            const res = await auth.registrarComprador({
                nombre: 'Camila',
                apellido: 'Vázquez',
                email: 'camila@example.com',
                password: 'segura123'
            });

            assert.ok(res.token.includes('.'), 'El token debe tener formato JWT');
            assert.strictEqual(res.usuario.nombre, 'Camila');
            assert.strictEqual(res.usuario.rol, 'Comprador');
        });

        await st.test('Registra organizador vinculando productora y rol', async () => {
            const res = await auth.registrarOrganizador({
                nombre: 'Esteban',
                apellido: 'Quito',
                nombreProductora: 'Quito Fest',
                email: 'esteban@quitofest.com',
                password: 'segura123'
            });

            assert.ok(res.token.includes('.'));
            assert.strictEqual(res.usuario.nombreProductora, 'Quito Fest');
            assert.strictEqual(res.usuario.rol, 'Organizador');
            assert.strictEqual(res.usuario.nombreCompleto, 'Quito Fest');
        });

        await st.test('Rechaza registros duplicados con el mismo email', async () => {
            await assert.rejects(
                async () => {
                    await auth.registrarComprador({
                        nombre: 'Clon',
                        apellido: 'Vázquez',
                        email: 'camila@example.com',
                        password: 'password123'
                    });
                },
                /ya se encuentra registrado/
            );
        });

        await st.test('Login exitoso con credenciales válidas y rechazo con erróneas', async () => {
            const ok = await auth.login({
                email: 'camila@example.com',
                password: 'segura123'
            });
            assert.strictEqual(ok.usuario.email, 'camila@example.com');

            await assert.rejects(
                async () => {
                    await auth.login({
                        email: 'camila@example.com',
                        password: 'password-incorrecto'
                    });
                },
                /Credenciales inválidas/
            );
        });

        await st.test('Acceso rápido Demo genera sesión instantánea para Martina y Luna Producciones', async () => {
            const demoBuyer = await auth.loginDemo('Comprador');
            assert.strictEqual(demoBuyer.usuario.id, 'usr-comprador-1');
            assert.strictEqual(demoBuyer.usuario.nombre, 'Martina');

            const demoOrg = await auth.loginDemo('Organizador');
            assert.strictEqual(demoOrg.usuario.id, 'usr-org-1');
            assert.strictEqual(demoOrg.usuario.nombreProductora, 'Luna Producciones');
        });
    });

    await t.test('NotificacionService & Repository', async (st) => {
        const repo = new NotificacionRepository();
        const service = new NotificacionService({ notificacionRepo: repo });

        await st.test('Lista notificaciones diferenciadas por rolDestino', async () => {
            const notifsComprador = await service.listar({ rolDestino: 'Comprador' });
            assert.ok(notifsComprador.length >= 2);
            assert.ok(notifsComprador.every((n) => n.rolDestino === 'Comprador'));

            const notifsOrg = await service.listar({ rolDestino: 'Organizador' });
            assert.ok(notifsOrg.length >= 2);
            assert.ok(notifsOrg.every((n) => n.rolDestino === 'Organizador'));
        });

        await st.test('Marca una notificación individual como leída', async () => {
            const antes = await service.conteoNoLeidas({ rolDestino: 'Comprador' });
            assert.ok(antes.unreadCount > 0);

            const notifs = await service.listar({ rolDestino: 'Comprador', noLeidas: true });
            const primera = notifs[0];
            const actualizada = await service.marcarLeida(primera.id);
            assert.strictEqual(actualizada.leida, true);
        });

        await st.test('Marca todas las notificaciones como leídas y descuenta badge a cero', async () => {
            await service.marcarTodasLeidas({ rolDestino: 'Organizador' });
            const conteo = await service.conteoNoLeidas({ rolDestino: 'Organizador' });
            assert.strictEqual(conteo.unreadCount, 0);
        });

        await st.test('Crea disparador de notificación en tiempo real', async () => {
            const creada = await service.crearNotificacion({
                usuarioId: 'usr-comprador-1',
                rolDestino: 'Comprador',
                tipo: TIPOS_NOTIFICACION.CUENTA_REGRESIVA,
                titulo: '¡Tu recital es mañana!',
                mensaje: 'Preparate para Luna Park Sessions.',
            });
            assert.strictEqual(creada.tipo, TIPOS_NOTIFICACION.CUENTA_REGRESIVA);
            assert.strictEqual(creada.leida, false);
        });
    });
});
