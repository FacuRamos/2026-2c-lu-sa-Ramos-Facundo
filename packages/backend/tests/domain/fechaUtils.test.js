import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { aObjetoFecha, calcularDiasFaltantes, esFechaPasada } from '../../src/domain/utils/fechaUtils.js';

describe('fechaUtils Domain Functions', () => {
    it('aObjetoFecha convierte strings y fechas correctamente', () => {
        const d = new Date('2026-10-25T12:00:00Z');
        assert.strictEqual(aObjetoFecha(d), d);
        assert.strictEqual(aObjetoFecha('2026-10-25T12:00:00Z')?.toISOString(), d.toISOString());
        assert.strictEqual(aObjetoFecha('invalido'), null);
        assert.strictEqual(aObjetoFecha(null), null);
    });

    it('calcularDiasFaltantes calcula correctamente la diferencia en días', () => {
        const ref = new Date('2026-10-20T00:00:00Z');
        const evento = new Date('2026-10-25T00:00:00Z');
        assert.strictEqual(calcularDiasFaltantes(evento, ref), 5);

        // Si ya pasó
        const pasado = new Date('2026-10-15T00:00:00Z');
        assert.ok(calcularDiasFaltantes(pasado, ref) <= 0);
    });

    it('esFechaPasada determina si una fecha es anterior o igual a la referencia', () => {
        const ref = new Date('2026-10-20T12:00:00Z');
        assert.strictEqual(esFechaPasada('2026-10-19T12:00:00Z', ref), true);
        assert.strictEqual(esFechaPasada('2026-10-21T12:00:00Z', ref), false);
        assert.strictEqual(esFechaPasada(null, ref), false);
    });
});
