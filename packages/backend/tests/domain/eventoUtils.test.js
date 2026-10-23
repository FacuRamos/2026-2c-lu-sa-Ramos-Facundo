import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calcularPuntajeOrganizador, filtrarEventos, ordenarEventos } from '../../src/domain/utils/eventoUtils.js';
import { Evento } from '../../src/domain/entities/evento.js';
import { TipoEntrada } from '../../src/domain/entities/tipoEntrada.js';
import { Categoria } from '../../src/domain/entities/categoria.js';
import { Usuario } from '../../src/domain/entities/usuario.js';
import { Resenia } from '../../src/domain/entities/resenia.js';
import { DomainValidationError } from '../../src/domain/errors/DomainError.js';

describe('eventoUtils Domain Functions', () => {
    const org1 = new Usuario({ id: 'org-1', nombre: 'Organizador', apellido: 'Uno' });
    const org2 = new Usuario({ id: 'org-2', nombre: 'Organizador', apellido: 'Dos' });
    const catRock = new Categoria({ id: 'cat-rock', nombre: 'Rock' });
    const catJazz = new Categoria({ id: 'cat-jazz', nombre: 'Jazz' });

    const ev1 = new Evento({
        id: 'ev-1',
        nombre: 'Rock en la Plaza',
        descripcion: 'Festival al aire libre',
        categoria: catRock,
        organizador: org1,
        fecha: new Date('2026-10-01'),
        tiposEntrada: [new TipoEntrada({ nombre: 'Entrada Unica', precio: 1000, cupo: 100 })]
    });

    const ev2 = new Evento({
        id: 'ev-2',
        nombre: 'Noche de Jazz',
        descripcion: 'Jazz fusión en club cerrado',
        categoria: catJazz,
        organizador: org2,
        fecha: new Date('2026-05-15'),
        tiposEntrada: [new TipoEntrada({ nombre: 'Mesa', precio: 5000, cupo: 50 })]
    });

    const ev3 = new Evento({
        id: 'ev-3',
        nombre: 'Gran Festival Rock 2026',
        descripcion: 'Bandas consagradas',
        categoria: catRock,
        organizador: org1,
        fecha: new Date('2026-12-20'),
        tiposEntrada: [new TipoEntrada({ nombre: 'Campo', precio: 3000, cupo: 200 })]
    });

    const resenias = [
        new Resenia({ comprador: new Usuario({ nombre: 'A', apellido: 'A' }), evento: ev1, detalle: 'Muy bueno', puntuacion: 5 }),
        new Resenia({ comprador: new Usuario({ nombre: 'B', apellido: 'B' }), evento: ev3, detalle: 'Regular', puntuacion: 3 }),
        new Resenia({ comprador: new Usuario({ nombre: 'C', apellido: 'C' }), evento: ev2, detalle: 'Excelente', puntuacion: 4 })
    ];

    it('calcularPuntajeOrganizador calcula el promedio correcto de las reseñas del organizador', () => {
        // org1 tiene ev1 (5) y ev3 (3) -> promedio = 4.0
        const puntajeOrg1 = calcularPuntajeOrganizador('org-1', resenias);
        assert.strictEqual(puntajeOrg1, 4);

        // org2 tiene ev2 (4) -> promedio = 4.0
        const puntajeOrg2 = calcularPuntajeOrganizador('org-2', resenias);
        assert.strictEqual(puntajeOrg2, 4);

        // Organizador sin reseñas -> 0
        const sinResenias = calcularPuntajeOrganizador('org-inexistente', resenias);
        assert.strictEqual(sinResenias, 0);
    });

    it('filtrarEventos filtra por texto, categoría y rango de precio', () => {
        const eventos = [ev1, ev2, ev3];

        // Filtro por texto
        const filtroTexto = filtrarEventos(eventos, { busqueda: 'jazz' });
        assert.strictEqual(filtroTexto.length, 1);
        assert.strictEqual(filtroTexto[0].id, 'ev-2');

        // Filtro por categoría
        const filtroCat = filtrarEventos(eventos, { categoriaId: 'cat-rock' });
        assert.strictEqual(filtroCat.length, 2);

        // Filtro por precio
        const filtroPrecio = filtrarEventos(eventos, { precioMin: 2000, precioMax: 4000 });
        assert.strictEqual(filtroPrecio.length, 1);
        assert.strictEqual(filtroPrecio[0].id, 'ev-3');
    });

    it('ordenarEventos ordena por precio asc y desc', () => {
        const eventos = [ev1, ev2, ev3]; // precios mínimos: ev1=1000, ev2=5000, ev3=3000

        const porPrecioAsc = ordenarEventos(eventos, { criterio: 'precio', direccion: 'asc' });
        assert.deepStrictEqual(porPrecioAsc.map(e => e.id), ['ev-1', 'ev-3', 'ev-2']);

        const porPrecioDesc = ordenarEventos(eventos, { criterio: 'precio', direccion: 'desc' });
        assert.deepStrictEqual(porPrecioDesc.map(e => e.id), ['ev-2', 'ev-3', 'ev-1']);
    });

    it('ordenarEventos ordena por fecha asc y desc', () => {
        const eventos = [ev1, ev2, ev3]; // fechas: ev2 (mayo), ev1 (octubre), ev3 (diciembre)

        const porFechaAsc = ordenarEventos(eventos, { criterio: 'fecha', direccion: 'asc' });
        assert.deepStrictEqual(porFechaAsc.map(e => e.id), ['ev-2', 'ev-1', 'ev-3']);

        const porFechaDesc = ordenarEventos(eventos, { criterio: 'fecha', direccion: 'desc' });
        assert.deepStrictEqual(porFechaDesc.map(e => e.id), ['ev-3', 'ev-1', 'ev-2']);
    });

    it('ordenarEventos ordena por puntaje del organizador', () => {
        // Añadir una reseña adicional para diferenciar: ev1 recibe otro 5 -> org1 promedio = 4.33
        const reseniasExtra = [
            ...resenias,
            new Resenia({ comprador: new Usuario({ nombre: 'D', apellido: 'D' }), evento: ev1, detalle: 'Genial', puntuacion: 5 })
        ];

        const porPuntajeDesc = ordenarEventos([ev1, ev2], {
            criterio: 'puntajeOrganizador',
            direccion: 'desc',
            resenias: reseniasExtra
        });
        assert.strictEqual(porPuntajeDesc[0].id, 'ev-1');
    });

    it('falla ante criterio de ordenamiento desconocido', () => {
        assert.throws(() => {
            ordenarEventos([ev1], { criterio: 'desconocido' });
        }, DomainValidationError);
    });
});
