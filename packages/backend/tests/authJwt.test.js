import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { Usuario } from '../src/domain/entities/usuario.js';
import { authService, JWT_SECRET } from '../src/services/AuthService.js';
import { usuarioRepository } from '../src/repositories/index.js';
import { authMiddleware } from '../src/middlewares/authMiddleware.js';
import { requireRole } from '../src/middlewares/requireRole.js';

describe('SPEC-009: JWT & BCrypt Authentication and RBAC Authorization Suite', () => {
    let server;
    let baseUrl;

    before(async () => {
        await usuarioRepository.clear();
        const app = createApp();
        await new Promise((resolve) => {
            server = app.listen(0, () => {
                const port = server.address().port;
                baseUrl = `http://127.0.0.1:${port}`;
                resolve();
            });
        });
    });

    after(async () => {
        await new Promise((resolve) => server.close(resolve));
    });

    describe('BCrypt Password Hashing & Verification (Slide 63)', () => {
        it('hashea contraseñas con salt rounds de bcrypt y nunca las almacena en texto plano', async () => {
            const rawPassword = 'SuperSecretPassword2026!';
            const hash = await Usuario.hashPassword(rawPassword);

            assert.ok(hash.startsWith('$2b$') || hash.startsWith('$2a$'));
            assert.notStrictEqual(hash, rawPassword);

            const usuario = new Usuario({
                nombre: 'Ana',
                apellido: 'Vallejos',
                email: 'ana@example.com',
                password: hash,
                rol: 'Comprador'
            });

            assert.strictEqual(await usuario.verificarPassword(rawPassword), true);
            assert.strictEqual(await usuario.verificarPassword('passwordIncorrecta'), false);
        });

        it('toJSON() y serialización nunca exponen el hash o password del usuario', async () => {
            const hash = await Usuario.hashPassword('pass1234');
            const usuario = new Usuario({
                nombre: 'Esteban',
                apellido: 'Quito',
                email: 'esteban@example.com',
                password: hash
            });

            const json = usuario.toJSON();
            assert.strictEqual(json.password, undefined);
            assert.strictEqual(JSON.stringify(usuario).includes(hash), false);
        });
    });

    describe('JWT Token Generation & Claims (Slides 58-63)', () => {
        it('emite token JWT con claims estándar { sub, role, email, exp } y firma válida', async () => {
            const hash = await Usuario.hashPassword('claveSecreta123');
            const user = new Usuario({
                id: 'usr-jwt-test',
                nombre: 'Valeria',
                apellido: 'Lynch',
                email: 'valeria@musica.com',
                password: hash,
                rol: 'Organizador',
                nombreProductora: 'Lynch Shows'
            });
            await usuarioRepository.create(user);

            const loginRes = await authService.login({
                email: 'valeria@musica.com',
                password: 'claveSecreta123'
            });

            assert.ok(loginRes.token);
            assert.ok(loginRes.refreshToken);

            const decoded = jwt.verify(loginRes.token, JWT_SECRET);
            assert.strictEqual(decoded.sub, 'usr-jwt-test');
            assert.strictEqual(decoded.email, 'valeria@musica.com');
            assert.strictEqual(decoded.role, 'Organizador');
            assert.ok(decoded.exp > decoded.iat);
        });

        it('responde 401 con mensaje genérico ante email o password erróneos (Anti-enumeración, Slide 62)', async () => {
            // Email inexistente
            await assert.rejects(
                () => authService.login({ email: 'inexistente@example.com', password: 'password123' }),
                (err) => {
                    assert.strictEqual(err.message, 'Credenciales inválidas');
                    assert.strictEqual(err.status, 401);
                    return true;
                }
            );

            // Password incorrecta
            await assert.rejects(
                () => authService.login({ email: 'valeria@musica.com', password: 'claveEquivocada' }),
                (err) => {
                    assert.strictEqual(err.message, 'Credenciales inválidas');
                    assert.strictEqual(err.status, 401);
                    return true;
                }
            );
        });
    });

    describe('authMiddleware Unit & Edge Cases (Slide 64)', () => {
        it('rechaza con 401 si no se envía la cabecera Authorization', () => {
            const req = { headers: {} };
            let status = null;
            let responseJson = null;
            const res = {
                status: (s) => {
                    status = s;
                    return { json: (j) => { responseJson = j; } };
                }
            };
            const next = () => { assert.fail('No debería llamar a next()'); };

            authMiddleware(req, res, next);
            assert.strictEqual(status, 401);
            assert.strictEqual(responseJson.error, 'No autenticado');
        });

        it('rechaza con 401 si el token está vencido (TokenExpiredError)', () => {
            const expiredToken = jwt.sign(
                { sub: 'usr-expired', role: 'Comprador' },
                JWT_SECRET,
                { expiresIn: -10 }
            );

            const req = { headers: { authorization: `Bearer ${expiredToken}` } };
            let status = null;
            let responseJson = null;
            const res = {
                status: (s) => {
                    status = s;
                    return { json: (j) => { responseJson = j; } };
                }
            };

            authMiddleware(req, res, () => {});
            assert.strictEqual(status, 401);
            assert.strictEqual(responseJson.error, 'Token expirado');
        });

        it('rechaza con 401 si la firma es inválida (JsonWebTokenError)', () => {
            const fakeToken = jwt.sign(
                { sub: 'usr-fake', role: 'Comprador' },
                'otra-clave-secreta-totalmente-distinta'
            );

            const req = { headers: { authorization: `Bearer ${fakeToken}` } };
            let status = null;
            let responseJson = null;
            const res = {
                status: (s) => {
                    status = s;
                    return { json: (j) => { responseJson = j; } };
                }
            };

            authMiddleware(req, res, () => {});
            assert.strictEqual(status, 401);
            assert.strictEqual(responseJson.error, 'Token inválido');
        });

        it('permite acceso e inyecta req.user si el token es legítimo', () => {
            const validToken = jwt.sign(
                { sub: 'usr-valido-1', role: 'Comprador', email: 'valido@test.com' },
                JWT_SECRET,
                { expiresIn: '15m' }
            );

            const req = { headers: { authorization: `Bearer ${validToken}` } };
            const res = {};
            let nextCalled = false;

            authMiddleware(req, res, () => { nextCalled = true; });
            assert.strictEqual(nextCalled, true);
            assert.strictEqual(req.user.sub, 'usr-valido-1');
            assert.strictEqual(req.user.role, 'Comprador');
        });
    });

    describe('requireRole RBAC Authorization (Slide 69)', () => {
        it('permite acceso cuando el usuario tiene el rol requerido', () => {
            const middleware = requireRole('Organizador');
            const req = { user: { sub: 'usr-org-1', role: 'Organizador' } };
            let nextCalled = false;

            middleware(req, {}, () => { nextCalled = true; });
            assert.strictEqual(nextCalled, true);
        });

        it('soporta alias en inglés y español (buyer / organizer)', () => {
            const middleware = requireRole('organizer');
            const req = { user: { sub: 'usr-org-1', role: 'Organizador' } };
            let nextCalled = false;

            middleware(req, {}, () => { nextCalled = true; });
            assert.strictEqual(nextCalled, true);
        });

        it('responde 403 Forbidden cuando el rol no coincide (Comprador intentando acción de Organizador)', () => {
            const middleware = requireRole('Organizador');
            const req = { user: { sub: 'usr-buyer-1', role: 'Comprador' } };
            let status = null;
            let responseJson = null;
            const res = {
                status: (s) => {
                    status = s;
                    return { json: (j) => { responseJson = j; } };
                }
            };

            middleware(req, res, () => { assert.fail('No debería permitir acceso'); });
            assert.strictEqual(status, 403);
            assert.strictEqual(responseJson.error, 'Acceso denegado');
            assert.strictEqual(responseJson.message, 'Permisos insuficientes para realizar esta acción');
        });
    });

    describe('HTTP Endpoints Security: /api/auth/me y RBAC en Rutas (Slide 70)', () => {
        it('GET /api/auth/me responde 401 si no se envía Bearer token', async () => {
            const res = await fetch(`${baseUrl}/api/auth/me`);
            assert.strictEqual(res.status, 401);
            const data = await res.json();
            assert.strictEqual(data.error, 'No autenticado');
        });

        it('GET /api/auth/me responde 200 y el perfil sin contraseña con Bearer token válido', async () => {
            const token = jwt.sign(
                { sub: 'usr-jwt-test', role: 'Organizador', email: 'valeria@musica.com' },
                JWT_SECRET,
                { expiresIn: '15m' }
            );

            const res = await fetch(`${baseUrl}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            assert.strictEqual(res.status, 200);
            const user = await res.json();
            assert.strictEqual(user.id, 'usr-jwt-test');
            assert.strictEqual(user.email, 'valeria@musica.com');
            assert.strictEqual(user.password, undefined);
        });

        it('POST /api/eventos responde 401 si se intenta crear evento anónimamente', async () => {
            const res = await fetch(`${baseUrl}/api/eventos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: 'Evento Anónimo' })
            });
            assert.strictEqual(res.status, 401);
        });

        it('POST /api/eventos responde 403 Forbidden si un Comprador intenta crear un evento', async () => {
            const tokenComprador = jwt.sign(
                { sub: 'usr-comprador-test', role: 'Comprador' },
                JWT_SECRET,
                { expiresIn: '15m' }
            );

            const res = await fetch(`${baseUrl}/api/eventos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${tokenComprador}`
                },
                body: JSON.stringify({ nombre: 'Evento Ilegal' })
            });
            assert.strictEqual(res.status, 403);
            const err = await res.json();
            assert.strictEqual(err.error, 'Acceso denegado');
        });
    });
});
