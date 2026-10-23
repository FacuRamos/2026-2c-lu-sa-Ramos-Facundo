import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Usuario } from '../../src/domain/entities/usuario.js';
import { DomainValidationError } from '../../src/domain/errors/DomainError.js';

describe('Usuario Domain Entity', () => {
    it('crea un usuario válido con nombre, apellido y email', () => {
        const u = new Usuario({
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan@example.com'
        });

        assert.strictEqual(u.nombre, 'Juan');
        assert.strictEqual(u.apellido, 'Pérez');
        assert.strictEqual(u.email, 'juan@example.com');
        assert.strictEqual(u.nombreCompleto, 'Juan Pérez');
        assert.strictEqual(Array.isArray(u.favoritos), true);
        assert.strictEqual(u.favoritos.length, 0);
        assert.ok(u.id);
    });

    it('falla si falta el nombre o es vacío', () => {
        assert.throws(() => {
            new Usuario({ apellido: 'Pérez' });
        }, (err) => {
            assert.ok(err instanceof DomainValidationError);
            assert.match(err.message, /nombre/i);
            return true;
        });

        assert.throws(() => {
            new Usuario({ nombre: '   ', apellido: 'Pérez' });
        }, DomainValidationError);
    });

    it('falla si falta el apellido o es vacío', () => {
        assert.throws(() => {
            new Usuario({ nombre: 'Juan' });
        }, (err) => {
            assert.ok(err instanceof DomainValidationError);
            assert.match(err.message, /apellido/i);
            return true;
        });
    });

    it('permite gestionar eventos favoritos (agregar, verificar y remover)', () => {
        const u = new Usuario({ nombre: 'Ana', apellido: 'Gómez' });
        const evento1 = { id: 'ev-1', nombre: 'Recital Rock' };
        const evento2 = { id: 'ev-2', nombre: 'Festival Jazz' };

        // Agregar favorito
        u.agregarFavorito(evento1);
        assert.strictEqual(u.favoritos.length, 1);
        assert.strictEqual(u.esFavorito('ev-1'), true);
        assert.strictEqual(u.esFavorito('ev-2'), false);

        // No duplica si se agrega el mismo
        u.agregarFavorito(evento1);
        assert.strictEqual(u.favoritos.length, 1);

        // Agregar segundo
        u.agregarFavorito(evento2);
        assert.strictEqual(u.favoritos.length, 2);
        assert.strictEqual(u.esFavorito('ev-2'), true);

        // Eliminar favorito
        const eliminado = u.eliminarFavorito('ev-1');
        assert.strictEqual(eliminado, true);
        assert.strictEqual(u.favoritos.length, 1);
        assert.strictEqual(u.esFavorito('ev-1'), false);
        assert.strictEqual(u.esFavorito('ev-2'), true);

        // Eliminar inexistente devuelve false
        const noExiste = u.eliminarFavorito('ev-999');
        assert.strictEqual(noExiste, false);
    });

    it('serializa a JSON correctamente', () => {
        const u = new Usuario({
            id: 'u-123',
            nombre: 'Carlos',
            apellido: 'López',
            email: 'carlos@test.com',
            favoritos: [{ id: 'ev-1' }, 'ev-2']
        });

        const json = u.toJSON();
        assert.strictEqual(json.id, 'u-123');
        assert.strictEqual(json.nombre, 'Carlos');
        assert.strictEqual(json.apellido, 'López');
        assert.deepStrictEqual(json.favoritos, ['ev-1', 'ev-2']);
    });
});
