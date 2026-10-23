import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { seedDemoData } from '../../data/seeders/demoSeeder.js';
import { usuarioRepository } from '../../src/repositories/UsuarioRepository.js';
import { categoriaRepository } from '../../src/repositories/CategoriaRepository.js';
import { eventoRepository } from '../../src/repositories/EventoRepository.js';
import { compraRepository } from '../../src/repositories/CompraRepository.js';
import { reseniaRepository } from '../../src/repositories/ReseniaRepository.js';

describe('Demo Seeder Test', () => {
    it('inicializa correctamente los datos de prueba en los repositorios en memoria', async () => {
        const resultado = await seedDemoData();

        assert.strictEqual(await usuarioRepository.count(), 4);
        assert.strictEqual(await categoriaRepository.count(), 3);
        assert.strictEqual(await eventoRepository.count(), 3);
        assert.strictEqual(await compraRepository.count(), 2);
        assert.strictEqual(await reseniaRepository.count(), 1);

        const comprador1 = await usuarioRepository.findById('usr-comprador-1');
        assert.ok(comprador1);
        assert.strictEqual(comprador1.nombre, 'Juan');
        assert.strictEqual(comprador1.favoritos.length, 1);

        const evRock = await eventoRepository.findById('ev-rock-2026');
        assert.ok(evRock);
        assert.strictEqual(evRock.tiposEntrada.length, 2);

        const reseniasPopArt = await reseniaRepository.findByOrganizador('usr-org-1');
        assert.strictEqual(reseniasPopArt.length, 1);
        assert.strictEqual(reseniasPopArt[0].puntuacion, 5);
    });
});
