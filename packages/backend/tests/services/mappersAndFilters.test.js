import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapCompraDto, mapMensajeDto, mapEventoSummaryDto } from '../../src/services/mappers.js';
import { filtrarEventos } from '../../src/domain/utils/eventoUtils.js';
import { Evento } from '../../src/domain/entities/evento.js';
import { TipoEntrada } from '../../src/domain/entities/tipoEntrada.js';
import { Compra } from '../../src/domain/entities/compra.js';
import { Usuario } from '../../src/domain/entities/usuario.js';
import { Categoria } from '../../src/domain/entities/categoria.js';

describe('DTO Mappers & Filtering UI Compatibility Tests', () => {
    const org = new Usuario({ id: 'usr-org-test', nombre: 'PopArt', apellido: 'Music', email: 'test@org.com', rol: 'Organizador' });
    const buyer = new Usuario({ id: 'usr-buyer-test', nombre: 'Facundo', apellido: 'Ramos', email: 'test@buyer.com', rol: 'Comprador' });
    const cat = new Categoria({ id: 'cat-rock', nombre: 'Rock' });
    const tipo = new TipoEntrada({ id: 't-vip', nombre: 'VIP Experience', precio: 25000, cupo: 100 });
    const ev = new Evento({
        id: 'ev-rock-test',
        nombre: 'Quilmes Rock',
        descripcion: 'Festival de rock nacional',
        categoria: cat,
        organizador: org,
        fecha: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        tiposEntrada: [tipo],
        multimedia: ['https://test.image/rock.jpg']
    });

    it('mapEventoSummaryDto incluye campos requeridos por las pantallas de React Native', () => {
        const dto = mapEventoSummaryDto(ev);
        assert.strictEqual(dto.id, 'ev-rock-test');
        assert.strictEqual(dto.nombre, 'Quilmes Rock');
        assert.strictEqual(dto.imagen, 'https://test.image/rock.jpg');
        assert.ok(dto.fechaTexto);
        assert.strictEqual(dto.organizadorId, 'usr-org-test');
    });

    it('mapCompraDto incluye campos canónicos y alias requeridos por PurchaseDetailScreen', () => {
        const compra = new Compra({
            id: 'cmp-test-1',
            comprador: buyer,
            evento: ev,
            tipoEntrada: tipo,
            cantidad: 2
        });

        const dto = mapCompraDto(compra);
        // Canónicos
        assert.strictEqual(dto.id, 'cmp-test-1');
        assert.strictEqual(dto.total, 50000);
        assert.strictEqual(dto.cantidad, 2);
        assert.ok(dto.evento);
        assert.ok(dto.entrada);

        // Alias UI esperados por PurchaseDetailScreen y PurchaseCard
        assert.strictEqual(dto.precioTotal, 50000);
        assert.strictEqual(typeof dto.diasRestantes, 'number');
        assert.strictEqual(dto.eventoTitulo, 'Quilmes Rock');
        assert.strictEqual(dto.eventoImagen, 'https://test.image/rock.jpg');
        assert.strictEqual(dto.tipoEntradaNombre, 'VIP Experience');
        assert.ok(dto.eventoFechaTexto);
    });

    it('mapMensajeDto incluye aliases texto, fecha y remitenteId para ChatScreen y ChatMessage', () => {
        const mensaje = {
            id: 'msg-01',
            usuario: buyer,
            mensaje: 'Hola, ¿a qué hora abre el ingreso?',
            enviado: new Date('2026-10-28T20:30:00.000Z')
        };

        const dto = mapMensajeDto(mensaje);
        assert.strictEqual(dto.id, 'msg-01');
        assert.strictEqual(dto.usuarioId, 'usr-buyer-test');
        assert.strictEqual(dto.remitenteId, 'usr-buyer-test');
        assert.strictEqual(dto.mensaje, 'Hola, ¿a qué hora abre el ingreso?');
        assert.strictEqual(dto.texto, 'Hola, ¿a qué hora abre el ingreso?');
        assert.ok(dto.fecha);
    });

    it('filtrarEventos aisla correctamente los eventos por organizadorId', () => {
        const org2 = new Usuario({ id: 'usr-org-otro', nombre: 'Otro', apellido: 'Org', email: 'otro@org.com', rol: 'Organizador' });
        const ev2 = new Evento({
            id: 'ev-otro',
            nombre: 'Teatro Colón',
            descripcion: 'Ópera',
            categoria: cat,
            organizador: org2,
            fecha: new Date(),
            tiposEntrada: [tipo]
        });

        const lista = [ev, ev2];
        const soloOrg1 = filtrarEventos(lista, { organizadorId: 'usr-org-test' });
        assert.strictEqual(soloOrg1.length, 1);
        assert.strictEqual(soloOrg1[0].id, 'ev-rock-test');

        const soloOrg2 = filtrarEventos(lista, { organizadorId: 'usr-org-otro' });
        assert.strictEqual(soloOrg2.length, 1);
        assert.strictEqual(soloOrg2[0].id, 'ev-otro');
    });

    it('rechaza la creación de eventos con fecha pasada retornando 400', async () => {
        const { createApp } = await import('../../src/app.js');
        const { seedDemoData } = await import('../../data/seeders/demoSeeder.js');
        const jwt = (await import('jsonwebtoken')).default;
        const { JWT_SECRET } = await import('../../src/services/AuthService.js');
        await seedDemoData();
        const app = createApp();
        const server = app.listen(0);
        const port = server.address().port;
        const orgToken = jwt.sign({ sub: 'usr-org-1', role: 'Organizador', rol: 'Organizador' }, JWT_SECRET, { expiresIn: '15m' });

        try {
            const res = await fetch(`http://localhost:${port}/api/eventos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${orgToken}`
                },
                body: JSON.stringify({
                    nombre: 'Evento Pasado Rechazado',
                    descripcion: 'No debería crearse',
                    categoriaId: 'cat-musica',
                    organizadorId: 'usr-org-1',
                    fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    tiposEntrada: [{ nombre: 'General', precio: 5000, cupo: 100 }]
                })
            });

            assert.strictEqual(res.status, 400);
            const body = await res.json();
            assert.ok(body.error?.includes('fecha pasada') || JSON.stringify(body).includes('fecha pasada'));
        } finally {
            server.close();
        }
    });
});
