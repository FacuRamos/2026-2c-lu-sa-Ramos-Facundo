import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { adaptCompra } from '../src/services/api/purchasesService.js';

describe('purchasesService adaptCompra Adapter Tests', () => {
  it('normaliza correctamente un DTO crudo de compra proveniente del backend', () => {
    const rawBackendCompra = {
      id: 'cmp-999',
      estado: 'CONFIRMADA',
      diasFaltantesParaEvento: 12,
      fechaCompra: '2026-08-20T10:00:00.000Z',
      cantidad: 2,
      total: 37000,
      evento: {
        id: 'ev-luna-park',
        nombre: 'Luna Park Sessions',
        fecha: '2026-09-01T20:30:00.000Z',
        organizadorNombre: 'Luna Producciones',
      },
      entrada: {
        id: 't-lp-general',
        nombre: 'General',
        precio: 18500,
      },
      mensajes: [
        {
          id: 'msg-1',
          usuarioId: 'usr-buyer-1',
          emisor: 'Martina',
          mensaje: '¿A qué hora empieza?',
          enviado: '2026-08-20T12:00:00.000Z',
        },
      ],
    };

    const adapted = adaptCompra(rawBackendCompra);

    // Prevención de $NaN
    assert.strictEqual(adapted.precioTotal, 37000);
    assert.strictEqual(adapted.total, 37000);
    assert.strictEqual(isNaN(adapted.precioTotal), false);

    // Días restantes y fechas
    assert.strictEqual(adapted.diasRestantes, 12);
    assert.strictEqual(adapted.eventoTitulo, 'Luna Park Sessions');
    assert.strictEqual(adapted.tipoEntradaNombre, 'General');
    assert.ok(adapted.eventoFechaTexto);
    assert.ok(adapted.eventoImagen);

    // Adaptación de mensajes
    assert.strictEqual(adapted.mensajes.length, 1);
    assert.strictEqual(adapted.mensajes[0].texto, '¿A qué hora empieza?');
    assert.strictEqual(adapted.mensajes[0].remitenteId, 'usr-buyer-1');
    assert.ok(adapted.mensajes[0].fecha);
  });

  it('maneja compras con campos faltantes sin generar errores de ejecución', () => {
    const emptyDto = {
      id: 'cmp-vacia',
      cantidad: 1,
    };

    const adapted = adaptCompra(emptyDto);
    assert.strictEqual(adapted.precioTotal, 0);
    assert.strictEqual(adapted.total, 0);
    assert.strictEqual(adapted.diasRestantes, 0);
    assert.strictEqual(adapted.eventoTitulo, 'Evento');
    assert.strictEqual(adapted.tipoEntradaNombre, 'General');
    assert.strictEqual(adapted.mensajes.length, 0);
  });
});
