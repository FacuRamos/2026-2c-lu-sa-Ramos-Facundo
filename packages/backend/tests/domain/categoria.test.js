import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Categoria } from '../../src/domain/entities/categoria.js';
import { DomainValidationError } from '../../src/domain/errors/DomainError.js';

describe('Categoria Domain Entity', () => {
    it('crea una categoría válida', () => {
        const cat = new Categoria({
            nombre: 'Música',
            descripcion: 'Conciertos y festivales'
        });

        assert.strictEqual(cat.nombre, 'Música');
        assert.strictEqual(cat.descripcion, 'Conciertos y festivales');
        assert.ok(cat.id);
    });

    it('falla si el nombre está vacío', () => {
        assert.throws(() => new Categoria({ nombre: '   ' }), DomainValidationError);
        assert.throws(() => new Categoria({}), DomainValidationError);
    });

    it('serializa a JSON correctamente', () => {
        const cat = new Categoria({ id: 'c-1', nombre: 'Teatro', descripcion: 'Obras dramáticas' });
        assert.deepStrictEqual(cat.toJSON(), {
            id: 'c-1',
            nombre: 'Teatro',
            descripcion: 'Obras dramáticas'
        });
    });
});
