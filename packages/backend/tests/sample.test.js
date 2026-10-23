import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import {
    usuarioRepository,
    categoriaRepository,
    eventoRepository,
    compraRepository,
    reseniaRepository
} from '../src/repositories/index.js';

describe('HTTP API End-to-End Integration Tests', () => {
    let server;
    let baseUrl;

    before(async () => {
        // Limpiar repositorios antes de los tests
        usuarioRepository.clear();
        categoriaRepository.clear();
        eventoRepository.clear();
        compraRepository.clear();
        reseniaRepository.clear();

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

    it('GET /api/health responde 200 con status ok', async () => {
        const res = await fetch(`${baseUrl}/api/health`);
        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.strictEqual(data.status, 'ok');
    });

    it('POST /api/usuarios valida con Zod y crea usuario (201), previene duplicado (409) y valida formato (400)', async () => {
        // Fallo de validación Zod (400)
        const resInvalido = await fetch(`${baseUrl}/api/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: '' })
        });
        assert.strictEqual(resInvalido.status, 400);

        // Creación exitosa (201)
        const resValido = await fetch(`${baseUrl}/api/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: 'Carlos',
                apellido: 'Gómez',
                email: 'carlos@test.com'
            })
        });
        assert.strictEqual(resValido.status, 201);
        const user = await resValido.json();
        assert.strictEqual(user.nombre, 'Carlos');
        assert.strictEqual(user.email, 'carlos@test.com');

        // Email duplicado (409)
        const resDup = await fetch(`${baseUrl}/api/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: 'Otro',
                apellido: 'Gómez',
                email: 'carlos@test.com'
            })
        });
        assert.strictEqual(resDup.status, 409);
    });

    it('Flujo completo de Eventos, Búsqueda, Validación cruzada Zod, Compra, Control de Acceso y Reseñas', async () => {
        // 1. Crear organizador y comprador
        const orgRes = await fetch(`${baseUrl}/api/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: 'Productora', apellido: 'Rock', email: 'org@rock.com' })
        });
        const organizador = await orgRes.json();

        const compRes = await fetch(`${baseUrl}/api/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: 'Fan', apellido: 'Musica', email: 'fan@rock.com' })
        });
        const comprador = await compRes.json();

        // 2. Crear categoría
        const catRes = await fetch(`${baseUrl}/api/categorias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: 'Conciertos' })
        });
        const categoria = await catRes.json();

        // 3. Crear evento (con multimedia como rutas relativas, permitidas por UML)
        const evRes = await fetch(`${baseUrl}/api/eventos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: 'Mega Recital 2026',
                descripcion: 'El mejor festival de música en vivo',
                categoriaId: categoria.id,
                organizadorId: organizador.id,
                fecha: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                tiposEntrada: [
                    { id: 't-vip', nombre: 'VIP', precio: 10000, cupo: 5 },
                    { id: 't-campo', nombre: 'Campo', precio: 5000, cupo: 20 }
                ],
                multimedia: ['assets/flyer.jpg', '/images/stage.png']
            })
        });
        assert.strictEqual(evRes.status, 201);
        const evento = await evRes.json();
        assert.strictEqual(evento.nombre, 'Mega Recital 2026');

        // 4. Búsqueda con validación Zod refinada: precioMin > precioMax debe fallar con 400
        const resRefine = await fetch(`${baseUrl}/api/eventos?precioMin=8000&precioMax=2000`);
        assert.strictEqual(resRefine.status, 400);

        // 5. Búsqueda válida
        const resSearch = await fetch(`${baseUrl}/api/eventos?busqueda=Mega`);
        assert.strictEqual(resSearch.status, 200);
        const evs = await resSearch.json();
        assert.strictEqual(evs.length, 1);

        // 6. Realizar compra (CU12)
        const compraRes = await fetch(`${baseUrl}/api/compras`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                compradorId: comprador.id,
                eventoId: evento.id,
                tipoEntradaId: 't-vip',
                cantidad: 2
            })
        });
        assert.strictEqual(compraRes.status, 201);
        const compra = await compraRes.json();
        assert.strictEqual(compra.total, 20000);
        assert.strictEqual(compra.estado, 'CONFIRMADA');

        // 7. CU1: Visualizar compras del comprador
        const misComprasRes = await fetch(`${baseUrl}/api/compras/comprador/${comprador.id}`);
        assert.strictEqual(misComprasRes.status, 200);
        const misCompras = await misComprasRes.json();
        assert.strictEqual(misCompras.length, 1);
        assert.ok(typeof misCompras[0].diasFaltantesParaEvento === 'number');

        // 8. CU2: Visualizar compras de evento (debe exigir organizadorId y rechazar llamadas sin él o de intruso)
        // Sin organizadorId -> 400 Bad Request
        const resSinOrg = await fetch(`${baseUrl}/api/compras/evento/${evento.id}`);
        assert.strictEqual(resSinOrg.status, 400);

        // Con organizadorId intruso -> 403 Unauthorized
        const resIntruso = await fetch(`${baseUrl}/api/compras/evento/${evento.id}?organizadorId=${comprador.id}`);
        assert.strictEqual(resIntruso.status, 403);

        // Con organizadorId válido -> 200 OK
        const resOrgOk = await fetch(`${baseUrl}/api/compras/evento/${evento.id}?organizadorId=${organizador.id}`);
        assert.strictEqual(resOrgOk.status, 200);
        const reporteEvento = await resOrgOk.json();
        assert.strictEqual(reporteEvento.totalCompras, 1);

        // 9. CU8/CU9: Marcar entrada utilizada (debe exigir usuarioId del organizador)
        // Sin usuarioId -> 400 Bad Request
        const resUtilizarSinId = await fetch(`${baseUrl}/api/compras/${compra.id}/utilizar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        assert.strictEqual(resUtilizarSinId.status, 400);

        // Con usuario no organizador -> 403 Forbidden
        const resUtilizarIntruso = await fetch(`${baseUrl}/api/compras/${compra.id}/utilizar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuarioId: comprador.id })
        });
        assert.strictEqual(resUtilizarIntruso.status, 403);

        // Con organizador legítimo -> 200 OK
        const resUtilizarOk = await fetch(`${baseUrl}/api/compras/${compra.id}/utilizar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuarioId: organizador.id })
        });
        assert.strictEqual(resUtilizarOk.status, 200);
        const compraUtilizada = await resUtilizarOk.json();
        assert.strictEqual(compraUtilizada.estado, 'UTILIZADA');

        // 10. CU9: Crear reseña posterior al evento
        const reseniaRes = await fetch(`${baseUrl}/api/resenias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                compradorId: comprador.id,
                eventoId: evento.id,
                compraId: compra.id,
                detalle: 'Una noche inolvidable, gran sonido.',
                puntuacion: 5
            })
        });
        assert.strictEqual(reseniaRes.status, 201);
        const resenia = await reseniaRes.json();
        assert.strictEqual(resenia.puntuacion, 5);

        // 11. CU10: Consultar reputación del organizador
        const repRes = await fetch(`${baseUrl}/api/resenias/organizador/${organizador.id}`);
        assert.strictEqual(repRes.status, 200);
        const reputacion = await repRes.json();
        assert.strictEqual(reputacion.puntajePromedio, 5);
        assert.strictEqual(reputacion.cantidadResenias, 1);
    });
});
