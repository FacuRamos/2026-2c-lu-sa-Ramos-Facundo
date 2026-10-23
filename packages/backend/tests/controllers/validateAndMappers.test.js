import { describe, it } from 'node:test';
import assert from 'node:assert';
import { z } from 'zod';
import { validate } from '../../src/controllers/utils/validate.js';
import { RequestValidationError } from '../../src/controllers/errors/ControllerError.js';
import {
    mapMensajeDto,
    mapDisponibilidadTipoDto,
    mapComprasPorEventoDto,
    mapResumenOrganizadorReseniasDto
} from '../../src/services/mappers.js';
import { Evento } from '../../src/domain/entities/evento.js';
import { Compra } from '../../src/domain/entities/compra.js';
import { Usuario } from '../../src/domain/entities/usuario.js';
import { Categoria } from '../../src/domain/entities/categoria.js';
import { TipoEntrada } from '../../src/domain/entities/tipoEntrada.js';
import { EstadoCompra } from '../../src/domain/enums/estadoCompra.js';

describe('SPEC-002: Validation Helper & Mappers Architecture Tests', () => {
    describe('validate() Helper', () => {
        const dummySchema = z.object({
            nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
            edad: z.number().int().min(18, 'Debe ser mayor de edad')
        });

        it('retorna los datos parseados cuando la entrada es válida', () => {
            const result = validate(dummySchema, { nombre: 'Facundo', edad: 25 });
            assert.deepStrictEqual(result, { nombre: 'Facundo', edad: 25 });
        });

        it('lanza RequestValidationError estructurado cuando los datos son inválidos', () => {
            assert.throws(() => {
                validate(dummySchema, { nombre: 'F', edad: 15 });
            }, (err) => {
                assert.ok(err instanceof RequestValidationError);
                assert.ok(err.details);
                assert.strictEqual(err.message, 'El nombre debe tener al menos 2 caracteres');
                return true;
            });
        });
    });

    describe('Mappers DTOs', () => {
        it('mapMensajeDto formatea correctamente una entidad de mensaje', () => {
            const mensaje = {
                id: 'msg-1',
                usuario: { id: 'usr-1', nombreCompleto: 'Juan Pérez' },
                mensaje: 'Hola, tengo una consulta',
                enviado: new Date('2026-10-22T10:00:00Z')
            };

            const dto = mapMensajeDto(mensaje);
            assert.strictEqual(dto.id, 'msg-1');
            assert.strictEqual(dto.usuarioId, 'usr-1');
            assert.strictEqual(dto.emisor, 'Juan Pérez');
            assert.strictEqual(dto.mensaje, 'Hola, tengo una consulta');
            assert.strictEqual(dto.enviado, '2026-10-22T10:00:00.000Z');
        });

        it('mapDisponibilidadTipoDto formatea los cupos vendidos y disponibles', () => {
            const tipo = {
                id: 'tipo-1',
                nombre: 'VIP',
                cupo: 100,
                cupoDisponible: 60
            };

            const dto = mapDisponibilidadTipoDto(tipo);
            assert.strictEqual(dto.tipoEntradaId, 'tipo-1');
            assert.strictEqual(dto.cupoTotal, 100);
            assert.strictEqual(dto.cupoDisponible, 60);
            assert.strictEqual(dto.vendidas, 40);
        });

        it('mapComprasPorEventoDto formatea reporte integral sin sobreexposición', () => {
            const evento = {
                id: 'ev-1',
                nombre: 'Rock Fest',
                fecha: new Date('2026-12-01T20:00:00Z'),
                tiposEntrada: [{ id: 't-1', nombre: 'Campo', cupo: 50, cupoDisponible: 45 }]
            };
            const compras = [{
                id: 'c-1',
                comprador: { id: 'u-1', nombreCompleto: 'Carlos' },
                tipoEntrada: { id: 't-1', nombre: 'Campo' },
                cantidad: 5,
                total: 25000,
                estado: EstadoCompra.CONFIRMADA,
                fechaCompra: new Date('2026-10-22T12:00:00Z')
            }];

            const dto = mapComprasPorEventoDto(evento, compras);
            assert.strictEqual(dto.eventoId, 'ev-1');
            assert.strictEqual(dto.totalCompras, 1);
            assert.strictEqual(dto.disponibilidadPorTipo[0].vendidas, 5);
            assert.strictEqual(dto.compras[0].compradorNombre, 'Carlos');
        });

        it('mapResumenOrganizadorReseniasDto formatea resumen con promedio y lista', () => {
            const organizador = { id: 'org-1', nombreCompleto: 'Productora Sur' };
            const resenias = [];
            const dto = mapResumenOrganizadorReseniasDto(organizador, resenias, 4.8);

            assert.strictEqual(dto.organizadorId, 'org-1');
            assert.strictEqual(dto.organizadorNombre, 'Productora Sur');
            assert.strictEqual(dto.puntajePromedio, 4.8);
            assert.strictEqual(dto.cantidadResenias, 0);
        });
    });

    describe('Domain Encapsulation & Aggregate Boundaries', () => {
        const cat = new Categoria({ id: 'c1', nombre: 'Música' });
        const org = new Usuario({ id: 'o1', nombre: 'Organizador', apellido: 'Pérez' });
        const comp = new Usuario({ id: 'u1', nombre: 'Comprador', apellido: 'Gómez' });
        const tipo = new TipoEntrada({ id: 't1', nombre: 'General', precio: 1000, cupo: 10 });
        const evento = new Evento({
            id: 'e1',
            nombre: 'Concierto',
            descripcion: 'Un concierto genial',
            categoria: cat,
            organizador: org,
            fecha: new Date('2026-12-31T20:00:00Z'),
            tiposEntrada: [tipo]
        });

        it('Evento.restituirCupo delega en el TipoEntrada correcto del agregado', () => {
            assert.strictEqual(tipo.cupoDisponible, 10);
            evento.descontarCupo('t1', 3);
            assert.strictEqual(tipo.cupoDisponible, 7);
            evento.restituirCupo('t1', 2);
            assert.strictEqual(tipo.cupoDisponible, 9);
        });

        it('Compra expone getters limpios compradorId, eventoId, tipoEntradaId y puedeSerReseniadaPor', () => {
            const compra = new Compra({
                id: 'compra-1',
                comprador: comp,
                evento,
                tipoEntrada: tipo,
                cantidad: 2,
                estado: EstadoCompra.CONFIRMADA
            });

            assert.strictEqual(compra.compradorId, 'u1');
            assert.strictEqual(compra.eventoId, 'e1');
            assert.strictEqual(compra.tipoEntradaId, 't1');

            // No puede ser reseñada si está CONFIRMADA
            assert.strictEqual(compra.puedeSerReseniadaPor(comp, evento), false);

            // Marcada utilizada
            compra.marcarUtilizada(org);
            assert.strictEqual(compra.puedeSerReseniadaPor(comp, evento), true);
            assert.strictEqual(compra.puedeSerReseniadaPor('otro-usuario', evento), false);
        });
    });
});
