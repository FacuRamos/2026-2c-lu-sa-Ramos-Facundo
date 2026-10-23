import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Compra } from '../../src/domain/entities/compra.js';
import { Usuario } from '../../src/domain/entities/usuario.js';
import { Evento } from '../../src/domain/entities/evento.js';
import { TipoEntrada } from '../../src/domain/entities/tipoEntrada.js';
import { Categoria } from '../../src/domain/entities/categoria.js';
import { EstadoCompra } from '../../src/domain/enums/estadoCompra.js';
import {
    DomainValidationError,
    InvalidStateTransitionError,
    UnauthorizedActionError
} from '../../src/domain/errors/DomainError.js';

describe('Compra Domain Entity', () => {
    const comprador = new Usuario({ id: 'user-comprador', nombre: 'Lucas', apellido: 'García' });
    const organizador = new Usuario({ id: 'user-org', nombre: 'Marta', apellido: 'Productora' });
    const tercero = new Usuario({ id: 'user-intruso', nombre: 'Esteban', apellido: 'Intruso' });
    const categoria = new Categoria({ id: 'c-1', nombre: 'Festivales' });
    const fechaFutura = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // en 5 días

    function crearFixtures() {
        const tipoEntrada = new TipoEntrada({
            id: 't-1',
            nombre: 'Campo',
            precio: 10000,
            cupo: 50,
            cupoDisponible: 48
        });

        const evento = new Evento({
            id: 'ev-1',
            nombre: 'Festival Primavera',
            descripcion: 'Música al aire libre',
            categoria,
            organizador,
            fecha: fechaFutura,
            tiposEntrada: [tipoEntrada]
        });

        const compra = new Compra({
            id: 'compra-1',
            comprador,
            evento,
            tipoEntrada,
            cantidad: 2,
            estado: EstadoCompra.CONFIRMADA
        });

        return { tipoEntrada, evento, compra };
    }

    it('crea una compra con valores calculados correctamente e historial inicial', () => {
        const { compra } = crearFixtures();

        assert.strictEqual(compra.total, 20000);
        assert.strictEqual(compra.cantidad, 2);
        assert.strictEqual(compra.estado, EstadoCompra.CONFIRMADA);
        assert.strictEqual(compra.historialEstados.length, 1);
        assert.strictEqual(compra.historialEstados[0].estado, EstadoCompra.CONFIRMADA);
        assert.strictEqual(compra.historialEstados[0].quien.id, comprador.id);
    });

    it('calcula días faltantes únicamente si la compra está CONFIRMADA', () => {
        const { compra } = crearFixtures();
        const dias = compra.diasParaElEvento();
        assert.ok(typeof dias === 'number');
        assert.ok(dias >= 4 && dias <= 6);

        // Si cambia de estado a CANCELADA, diasParaElEvento debe dar null por defecto
        compra.actualizarEstado(EstadoCompra.CANCELADA);
        assert.strictEqual(compra.diasParaElEvento(), null);
    });

    it('permite transiciones de estado válidas y rechaza las inválidas', () => {
        const { evento, tipoEntrada } = crearFixtures();
        const compraPendiente = new Compra({
            comprador,
            evento,
            tipoEntrada,
            cantidad: 1,
            estado: EstadoCompra.PENDIENTE
        });

        // PENDIENTE -> CONFIRMADA es válido
        compraPendiente.actualizarEstado(EstadoCompra.CONFIRMADA);
        assert.strictEqual(compraPendiente.estado, EstadoCompra.CONFIRMADA);
        assert.strictEqual(compraPendiente.historialEstados.length, 2);

        // CONFIRMADA -> UTILIZADA es válido
        compraPendiente.actualizarEstado(EstadoCompra.UTILIZADA);
        assert.strictEqual(compraPendiente.estado, EstadoCompra.UTILIZADA);

        // UTILIZADA -> PENDIENTE es inválido
        assert.throws(() => {
            compraPendiente.actualizarEstado(EstadoCompra.PENDIENTE);
        }, InvalidStateTransitionError);

        // Reintentar el mismo estado lanza InvalidStateTransitionError
        assert.throws(() => {
            compraPendiente.actualizarEstado(EstadoCompra.UTILIZADA);
        }, InvalidStateTransitionError);
    });

    it('cancela la compra y restituye el cupo disponible', () => {
        const { compra, tipoEntrada } = crearFixtures();
        const cupoAntes = tipoEntrada.cupoDisponible;

        compra.cancelar(comprador, new Date(), true, 'Problemas personales');
        assert.strictEqual(compra.estado, EstadoCompra.REEMBOLSADA);
        assert.strictEqual(tipoEntrada.cupoDisponible, cupoAntes + 2);
        assert.strictEqual(compra.puedeCancelarse(), false);
    });

    it('impide cancelar una compra ya UTILIZADA o si el evento ya ocurrió', () => {
        const { compra } = crearFixtures();
        compra.actualizarEstado(EstadoCompra.UTILIZADA);

        assert.strictEqual(compra.puedeCancelarse(), false);
        assert.throws(() => {
            compra.cancelar(comprador);
        }, InvalidStateTransitionError);

        // Evento en el pasado
        const eventoPasado = new Evento({
            nombre: 'Pasado',
            descripcion: 'desc',
            categoria,
            organizador,
            fecha: new Date('2025-01-01')
        });
        const tipoEntrada2 = new TipoEntrada({ nombre: 'T2', precio: 100, cupo: 10 });
        const compraEventoPasado = new Compra({
            comprador,
            evento: eventoPasado,
            tipoEntrada: tipoEntrada2,
            cantidad: 1,
            estado: EstadoCompra.CONFIRMADA
        });

        assert.strictEqual(compraEventoPasado.puedeCancelarse(), false);
        assert.throws(() => {
            compraEventoPasado.cancelar(comprador);
        }, InvalidStateTransitionError);
    });

    it('permite intercambiar mensajes solo entre comprador y organizador', () => {
        const { compra } = crearFixtures();

        // Comprador envía mensaje
        const msg1 = compra.agregarMensaje(comprador, '¿A qué hora abren las puertas?');
        assert.strictEqual(compra.mensajes.length, 1);
        assert.strictEqual(msg1.mensaje, '¿A qué hora abren las puertas?');

        // Organizador responde
        const msg2 = compra.agregarMensaje(organizador, 'Las puertas abren a las 18hs.');
        assert.strictEqual(compra.mensajes.length, 2);
        assert.strictEqual(msg2.usuario.id, organizador.id);

        // Intruso intenta enviar mensaje -> UnauthorizedActionError
        assert.throws(() => {
            compra.agregarMensaje(tercero, 'Hola yo no compré');
        }, UnauthorizedActionError);
    });
});
