import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TipoEntrada } from '../../src/domain/entities/tipoEntrada.js';
import { DomainValidationError, InsufficientCapacityError } from '../../src/domain/errors/DomainError.js';

describe('TipoEntrada Domain Entity', () => {
    it('crea un tipo de entrada válido', () => {
        const tipo = new TipoEntrada({
            nombre: 'VIP',
            descripcion: 'Acceso preferencial',
            precio: 15000,
            cupo: 50
        });

        assert.strictEqual(tipo.nombre, 'VIP');
        assert.strictEqual(tipo.descripcion, 'Acceso preferencial');
        assert.strictEqual(tipo.precio, 15000);
        assert.strictEqual(tipo.cupo, 50);
        assert.strictEqual(tipo.cupoDisponible, 50);
        assert.ok(tipo.id);
    });

    it('valida campos obligatorios y tipos correctos', () => {
        // Nombre vacío
        assert.throws(() => new TipoEntrada({ precio: 100, cupo: 10 }), DomainValidationError);
        // Precio negativo
        assert.throws(() => new TipoEntrada({ nombre: 'Gen', precio: -10, cupo: 10 }), DomainValidationError);
        // Cupo negativo o no entero
        assert.throws(() => new TipoEntrada({ nombre: 'Gen', precio: 100, cupo: -5 }), DomainValidationError);
        assert.throws(() => new TipoEntrada({ nombre: 'Gen', precio: 100, cupo: 10.5 }), DomainValidationError);
        // Cupo disponible mayor al total
        assert.throws(() => new TipoEntrada({ nombre: 'Gen', precio: 100, cupo: 10, cupoDisponible: 15 }), DomainValidationError);
    });

    it('verifica disponibilidad con hayCupoPara', () => {
        const tipo = new TipoEntrada({ nombre: 'General', precio: 5000, cupo: 10 });
        assert.strictEqual(tipo.hayCupoPara(5), true);
        assert.strictEqual(tipo.hayCupoPara(10), true);
        assert.strictEqual(tipo.hayCupoPara(11), false);
        assert.strictEqual(tipo.hayCupoPara(0), false);
        assert.strictEqual(tipo.hayCupoPara(-2), false);
    });

    it('descuenta cupo correctamente y lanza InsufficientCapacityError si supera cupo disponible', () => {
        const tipo = new TipoEntrada({ nombre: 'General', precio: 5000, cupo: 10 });

        tipo.descontarCupo(4);
        assert.strictEqual(tipo.cupoDisponible, 6);

        tipo.descontarCupo(6);
        assert.strictEqual(tipo.cupoDisponible, 0);

        assert.throws(() => tipo.descontarCupo(1), InsufficientCapacityError);
        assert.throws(() => tipo.descontarCupo(-1), DomainValidationError);
    });

    it('restituye cupo sin superar el total asignado', () => {
        const tipo = new TipoEntrada({ nombre: 'General', precio: 5000, cupo: 10, cupoDisponible: 5 });

        tipo.restituirCupo(3);
        assert.strictEqual(tipo.cupoDisponible, 8);

        // Si se restituye más que el cupo total, se capea en el cupo total
        tipo.restituirCupo(10);
        assert.strictEqual(tipo.cupoDisponible, 10);
    });
});
