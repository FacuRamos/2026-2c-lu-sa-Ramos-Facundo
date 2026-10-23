import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Resenia } from '../../src/domain/entities/resenia.js';
import { Usuario } from '../../src/domain/entities/usuario.js';
import { Evento } from '../../src/domain/entities/evento.js';
import { Categoria } from '../../src/domain/entities/categoria.js';
import { Compra } from '../../src/domain/entities/compra.js';
import { TipoEntrada } from '../../src/domain/entities/tipoEntrada.js';
import { EstadoCompra } from '../../src/domain/enums/estadoCompra.js';
import { DomainValidationError } from '../../src/domain/errors/DomainError.js';

describe('Resenia Domain Entity', () => {
    const comprador = new Usuario({ id: 'u-1', nombre: 'Martín', apellido: 'Paz' });
    const otroComprador = new Usuario({ id: 'u-2', nombre: 'Otro', apellido: 'Usuario' });
    const categoria = new Categoria({ id: 'cat-1', nombre: 'Teatro' });
    const evento = new Evento({
        id: 'ev-1',
        nombre: 'Hamlet',
        descripcion: 'Obra teatral',
        categoria,
        organizador: new Usuario({ id: 'org-1', nombre: 'Teatro', apellido: 'Nacional' }),
        fecha: new Date('2026-05-10')
    });
    const otroEvento = new Evento({
        id: 'ev-2',
        nombre: 'Otelo',
        descripcion: 'Otra obra',
        categoria,
        organizador: new Usuario({ id: 'org-1', nombre: 'Teatro', apellido: 'Nacional' }),
        fecha: new Date('2026-06-10')
    });

    it('crea una reseña válida con puntuación entre 1 y 5', () => {
        const resenia = new Resenia({
            comprador,
            evento,
            detalle: 'Excelente puesta en escena',
            puntuacion: 4.5
        });

        assert.strictEqual(resenia.detalle, 'Excelente puesta en escena');
        assert.strictEqual(resenia.puntuacion, 4.5);
        assert.ok(resenia.id);
        assert.ok(resenia.fecha instanceof Date);
    });

    it('falla si la puntuación es menor a 1 o mayor a 5 o no es numérica', () => {
        assert.throws(() => new Resenia({ comprador, evento, detalle: 'Bien', puntuacion: 0 }), DomainValidationError);
        assert.throws(() => new Resenia({ comprador, evento, detalle: 'Bien', puntuacion: 5.5 }), DomainValidationError);
        assert.throws(() => new Resenia({ comprador, evento, detalle: 'Bien', puntuacion: 'cinco' }), DomainValidationError);
    });

    it('falla si el comentario está vacío o faltan datos requeridos', () => {
        assert.throws(() => new Resenia({ comprador, evento, detalle: '   ', puntuacion: 4 }), DomainValidationError);
        assert.throws(() => new Resenia({ evento, detalle: 'Bien', puntuacion: 4 }), DomainValidationError);
        assert.throws(() => new Resenia({ comprador, detalle: 'Bien', puntuacion: 4 }), DomainValidationError);
    });

    it('valida que la compra habilita reseña únicamente si está en estado UTILIZADA y coincide comprador y evento', () => {
        const tipo = new TipoEntrada({ id: 't-1', nombre: 'Platea', precio: 2000, cupo: 10 });

        const compraConfirmada = new Compra({
            id: 'c-1',
            comprador,
            evento,
            tipoEntrada: tipo,
            cantidad: 1,
            estado: EstadoCompra.CONFIRMADA
        });

        // Falla porque aún no fue utilizada (CU9)
        assert.throws(() => {
            Resenia.validarCompraHabilitaResenia(compraConfirmada, comprador, evento);
        }, DomainValidationError);

        // Si se marca como utilizada, habilita la reseña
        compraConfirmada.marcarUtilizada();
        assert.strictEqual(Resenia.validarCompraHabilitaResenia(compraConfirmada, comprador, evento), true);

        // Falla si el comprador no coincide
        assert.throws(() => {
            Resenia.validarCompraHabilitaResenia(compraConfirmada, otroComprador, evento);
        }, DomainValidationError);

        // Falla si el evento no coincide
        assert.throws(() => {
            Resenia.validarCompraHabilitaResenia(compraConfirmada, comprador, otroEvento);
        }, DomainValidationError);
    });
});
