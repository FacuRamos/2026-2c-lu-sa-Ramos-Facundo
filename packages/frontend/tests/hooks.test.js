import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  SORT_OPTIONS,
  PURCHASE_TABS,
  filterAndSortEvents,
  filterPurchases,
  partitionEvents,
} from '../src/hooks/filterHelpers.js';
import { FONTS, RADIUS, COLORS, SPACING } from '../src/constants/theme.js';

describe('SPEC-004: Frontend Hooks & Architecture Tests', () => {
  const sampleEvents = [
    {
      id: 1,
      nombre: 'Festival de Jazz',
      descripcion: 'Noche de música en vivo',
      ubicacion: 'Teatro Colón',
      categoriaId: 'musica',
      categoriaNombre: 'Música',
      precioMinimo: 5000,
      fecha: '2026-11-20T20:00:00Z',
      organizadorPuntaje: 4.8,
      destacado: true,
    },
    {
      id: 2,
      nombre: 'Obra Teatral Clásica',
      descripcion: 'Comedia dramática',
      ubicacion: 'Calle Corrientes',
      categoriaId: 'teatro',
      categoriaNombre: 'Teatro',
      precioMinimo: 3500,
      fecha: '2026-10-30T19:00:00Z',
      organizadorPuntaje: 4.2,
      destacado: false,
    },
    {
      id: 3,
      nombre: 'Concierto de Rock',
      descripcion: 'Banda tributo acústica',
      ubicacion: 'Estadio Obras',
      categoriaId: 'musica',
      categoriaNombre: 'Música',
      precioMinimo: 8000,
      fecha: '2026-12-05T21:00:00Z',
      organizadorPuntaje: 4.9,
      destacado: false,
    },
  ];

  const samplePurchases = [
    { id: 'c1', estado: 'CONFIRMADA', diasRestantes: 5 },
    { id: 'c2', estado: 'PENDIENTE', diasRestantes: 10 },
    { id: 'c3', estado: 'UTILIZADA', diasRestantes: 0 },
    { id: 'c4', estado: 'CANCELADA', diasRestantes: 0 },
  ];

  describe('filterAndSortEvents Helper (useEventSearch)', () => {
    test('retorna todos los eventos si no hay filtros activos', () => {
      const result = filterAndSortEvents(sampleEvents);
      assert.strictEqual(result.length, 3);
    });

    test('filtra por búsqueda textual insensible a mayúsculas', () => {
      const result1 = filterAndSortEvents(sampleEvents, { query: 'jazz' });
      assert.strictEqual(result1.length, 1);
      assert.strictEqual(result1[0].id, 1);

      const result2 = filterAndSortEvents(sampleEvents, { query: 'COLÓN' });
      assert.strictEqual(result2.length, 1);
      assert.strictEqual(result2[0].id, 1);
    });

    test('filtra por categoría seleccionada', () => {
      const result = filterAndSortEvents(sampleEvents, { selectedCategory: 'teatro' });
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].id, 2);
    });

    test('ordena por precio ascendente', () => {
      const result = filterAndSortEvents(sampleEvents, { sortOption: 'precio_asc' });
      assert.strictEqual(result[0].precioMinimo, 3500);
      assert.strictEqual(result[2].precioMinimo, 8000);
    });

    test('ordena por precio descendente', () => {
      const result = filterAndSortEvents(sampleEvents, { sortOption: 'precio_desc' });
      assert.strictEqual(result[0].precioMinimo, 8000);
      assert.strictEqual(result[2].precioMinimo, 3500);
    });

    test('ordena por fecha cronológica ascendente', () => {
      const result = filterAndSortEvents(sampleEvents, { sortOption: 'fecha_asc' });
      assert.strictEqual(result[0].id, 2); // 2026-10-30
      assert.strictEqual(result[2].id, 3); // 2026-12-05
    });

    test('ordena por puntuación de organizador descendente', () => {
      const result = filterAndSortEvents(sampleEvents, { sortOption: 'puntaje_organizador' });
      assert.strictEqual(result[0].organizadorPuntaje, 4.9);
      assert.strictEqual(result[2].organizadorPuntaje, 4.2);
    });

    test('maneja colecciones nulas o indefinidas de forma segura', () => {
      assert.deepStrictEqual(filterAndSortEvents(null), []);
      assert.deepStrictEqual(filterAndSortEvents(undefined), []);
    });
  });

  describe('filterPurchases Helper (usePurchases)', () => {
    test('pestaña Todas retorna todas las compras registradas', () => {
      const result = filterPurchases(samplePurchases, 'Todas');
      assert.strictEqual(result.length, 4);
    });

    test('pestaña Próximas filtra solo compras CONFIRMADA o PENDIENTE', () => {
      const result = filterPurchases(samplePurchases, 'Próximas');
      assert.strictEqual(result.length, 2);
      assert.ok(result.every((p) => p.estado === 'CONFIRMADA' || p.estado === 'PENDIENTE'));
    });

    test('pestaña Pasadas filtra solo compras UTILIZADA o CANCELADA', () => {
      const result = filterPurchases(samplePurchases, 'Pasadas');
      assert.strictEqual(result.length, 2);
      assert.ok(result.every((p) => p.estado === 'UTILIZADA' || p.estado === 'CANCELADA'));
    });

    test('maneja listas nulas de forma segura', () => {
      assert.deepStrictEqual(filterPurchases(null, 'Todas'), []);
    });
  });

  describe('partitionEvents Helper (useEvents)', () => {
    test('separa eventos destacados de no destacados', () => {
      const { featured, other } = partitionEvents(sampleEvents, 'all');
      assert.strictEqual(featured.length, 1);
      assert.strictEqual(featured[0].id, 1);
      assert.strictEqual(other.length, 2);
    });

    test('aplica filtro de categoría antes de particionar', () => {
      const { filtered, featured, other } = partitionEvents(sampleEvents, 'teatro');
      assert.strictEqual(filtered.length, 1);
      assert.strictEqual(featured.length, 0);
      assert.strictEqual(other.length, 1);
      assert.strictEqual(other[0].id, 2);
    });
  });

  describe('Design Tokens & Hook Constants Integrity', () => {
    test('SORT_OPTIONS incluye las 5 opciones requeridas por el TP', () => {
      assert.strictEqual(SORT_OPTIONS.length, 5);
      const ids = SORT_OPTIONS.map((o) => o.id);
      assert.ok(ids.includes('default'));
      assert.ok(ids.includes('precio_asc'));
      assert.ok(ids.includes('precio_desc'));
      assert.ok(ids.includes('fecha_asc'));
      assert.ok(ids.includes('puntaje_organizador'));
    });

    test('PURCHASE_TABS contiene las tres pestañas oficiales', () => {
      assert.deepStrictEqual(PURCHASE_TABS, ['Todas', 'Próximas', 'Pasadas']);
    });

    test('tokens de tipografía y radios están completamente definidos', () => {
      assert.strictEqual(typeof FONTS.sizes.xs, 'number');
      assert.strictEqual(typeof FONTS.sizes.sm, 'number');
      assert.strictEqual(typeof FONTS.sizes.md, 'number');
      assert.strictEqual(typeof FONTS.sizes.lg, 'number');
      assert.strictEqual(typeof FONTS.sizes.xxl, 'number');
      assert.strictEqual(RADIUS.full, 999);
      assert.strictEqual(RADIUS.round, 999);
    });
  });
});
