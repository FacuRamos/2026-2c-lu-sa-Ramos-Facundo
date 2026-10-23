import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Evento } from '../../src/domain/entities/evento.js';
import { TipoEntrada } from '../../src/domain/entities/tipoEntrada.js';
import { Categoria } from '../../src/domain/entities/categoria.js';
import { Usuario } from '../../src/domain/entities/usuario.js';
import { DomainValidationError } from '../../src/domain/errors/DomainError.js';

describe('Evento Domain Entity', () => {
    const organizador = new Usuario({ id: 'org-1', nombre: 'Productora', apellido: 'Eventos' });
    const categoria = new Categoria({ id: 'cat-1', nombre: 'Festivales' });
    const fechaFutura = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // en 10 días

    it('crea un evento válido con tipos de entrada', () => {
        const evento = new Evento({
            nombre: 'Lollapalooza 2026',
            descripcion: 'Festival de música internacional',
            categoria,
            organizador,
            fecha: fechaFutura,
            tiposEntrada: [
                new TipoEntrada({ id: 't-1', nombre: 'General', precio: 50000, cupo: 100 }),
                { id: 't-2', nombre: 'VIP', precio: 120000, cupo: 20 }
            ],
            multimedia: ['https://example.com/poster.jpg']
        });

        assert.strictEqual(evento.nombre, 'Lollapalooza 2026');
        assert.strictEqual(evento.tiposEntrada.length, 2);
        assert.strictEqual(evento.multimedia.length, 1);
        assert.strictEqual(evento.hayCupoDisponible(), true);
        assert.strictEqual(evento.totalCupo(), 120);
        assert.strictEqual(evento.totalEntradasDisponibles(), 120);
        assert.strictEqual(evento.obtenerPrecioMinimo(), 50000);
        assert.strictEqual(evento.obtenerPrecioMaximo(), 120000);
    });

    it('valida campos requeridos del evento', () => {
        assert.throws(() => new Evento({ descripcion: 'desc', categoria, organizador, fecha: fechaFutura }), DomainValidationError);
        assert.throws(() => new Evento({ nombre: 'Evento', categoria, organizador, fecha: fechaFutura }), DomainValidationError);
        assert.throws(() => new Evento({ nombre: 'Evento', descripcion: 'desc', organizador, fecha: fechaFutura }), DomainValidationError);
        assert.throws(() => new Evento({ nombre: 'Evento', descripcion: 'desc', categoria, fecha: fechaFutura }), DomainValidationError);
        assert.throws(() => new Evento({ nombre: 'Evento', descripcion: 'desc', categoria, organizador, fecha: 'fecha-invalida' }), DomainValidationError);
    });

    it('no permite duplicar nombres o IDs de tipo de entrada en el evento', () => {
        const evento = new Evento({
            nombre: 'Show de Standup',
            descripcion: 'Comedia en vivo',
            categoria,
            organizador,
            fecha: fechaFutura
        });

        evento.agregarTipoEntrada(new TipoEntrada({ id: 't-1', nombre: 'General', precio: 3000, cupo: 50 }));
        assert.throws(() => {
            evento.agregarTipoEntrada(new TipoEntrada({ id: 't-2', nombre: 'general', precio: 4000, cupo: 10 }));
        }, DomainValidationError);
    });

    it('evalúa correctamente tuPrecioEstaEntre', () => {
        const evento = new Evento({
            nombre: 'Concierto',
            descripcion: 'Recital acústico',
            categoria,
            organizador,
            fecha: fechaFutura,
            tiposEntrada: [
                new TipoEntrada({ nombre: 'Platea', precio: 8000, cupo: 20 }),
                new TipoEntrada({ nombre: 'Campo', precio: 5000, cupo: 40 })
            ]
        });

        assert.strictEqual(evento.tuPrecioEstaEntre(4000, 6000), true);
        assert.strictEqual(evento.tuPrecioEstaEntre(7000, 9000), true);
        assert.strictEqual(evento.tuPrecioEstaEntre(9000, 10000), false);
        assert.strictEqual(evento.tuPrecioEstaEntre(6000, null), true); // mayor o igual a 6000
        assert.strictEqual(evento.tuPrecioEstaEntre(null, 4000), false);

        assert.throws(() => evento.tuPrecioEstaEntre(10000, 5000), DomainValidationError);
    });

    it('calcula si ya se realizó y días faltantes con precisión', () => {
        const pasado = new Date('2026-01-01T12:00:00Z');
        const eventoPasado = new Evento({
            nombre: 'Evento 2026 Pasado',
            descripcion: 'Ya ocurrió',
            categoria,
            organizador,
            fecha: pasado
        });

        const fechaRef = new Date('2026-01-10T12:00:00Z');
        assert.strictEqual(eventoPasado.yaSeRealizo(fechaRef), true);
        assert.ok(eventoPasado.diasFaltantes(fechaRef) <= 0);

        const futuro = new Date('2026-01-15T12:00:00Z');
        const eventoFuturo = new Evento({
            nombre: 'Evento 2026 Futuro',
            descripcion: 'Por ocurrir',
            categoria,
            organizador,
            fecha: futuro
        });
        assert.strictEqual(eventoFuturo.yaSeRealizo(fechaRef), false);
        assert.strictEqual(eventoFuturo.diasFaltantes(fechaRef), 5);
    });

    it('busca coincidencias por nombre, descripción o categoría', () => {
        const evento = new Evento({
            nombre: 'Cosquín Rock 2026',
            descripcion: 'Gran festival de las sierras',
            categoria: new Categoria({ nombre: 'Rock' }),
            organizador,
            fecha: fechaFutura
        });

        assert.strictEqual(evento.coincideConBusqueda('Cosquín'), true);
        assert.strictEqual(evento.coincideConBusqueda('sierras'), true);
        assert.strictEqual(evento.coincideConBusqueda('rock'), true);
        assert.strictEqual(evento.coincideConBusqueda('jazz'), false);
    });
});
