import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { apiService } from '../src/services/apiService.js';

describe('ApiService - Core Business and Domain Logic Tests', () => {
  beforeEach(() => {
    apiService.reset();
  });

  describe('Eventos and Filters', () => {
    test('obtiene eventos iniciales', async () => {
      const eventos = await apiService.getEventos();
      assert.ok(Array.isArray(eventos));
      assert.ok(eventos.length >= 4);
    });

    test('filtra por texto de búsqueda en nombre, descripción o ubicación', async () => {
      const porNombre = await apiService.getEventos({ texto: 'Luna Park' });
      assert.strictEqual(porNombre.length, 1);
      assert.strictEqual(porNombre[0].nombre, 'Luna Park Sessions');

      const porLugar = await apiService.getEventos({ texto: 'Picadero' });
      assert.strictEqual(porLugar.length, 1);
      assert.strictEqual(porLugar[0].nombre, 'La última función');
    });

    test('filtra por categoría', async () => {
      const musica = await apiService.getEventos({ categoriaId: 'cat-musica' });
      assert.ok(musica.length >= 2);
      assert.ok(musica.every(e => e.categoriaId === 'cat-musica'));
    });

    test('filtra por rango de precio', async () => {
      const baratos = await apiService.getEventos({ precioMax: 10000 });
      assert.ok(baratos.length > 0);
      assert.ok(baratos.every(e => e.precioMinimo <= 10000));
    });

    test('ordena eventos por precio ascendente y descendente', async () => {
      const asc = await apiService.getEventos({ ordenarPor: 'precio_asc' });
      for (let i = 0; i < asc.length - 1; i++) {
        assert.ok(asc[i].precioMinimo <= asc[i + 1].precioMinimo);
      }

      const desc = await apiService.getEventos({ ordenarPor: 'precio_desc' });
      for (let i = 0; i < desc.length - 1; i++) {
        assert.ok(desc[i].precioMinimo >= desc[i + 1].precioMinimo);
      }
    });

    test('ordena por puntaje de organizador descendente', async () => {
      const porPuntaje = await apiService.getEventos({ ordenarPor: 'puntaje_organizador' });
      for (let i = 0; i < porPuntaje.length - 1; i++) {
        assert.ok((porPuntaje[i].organizadorPuntaje || 0) >= (porPuntaje[i + 1].organizadorPuntaje || 0));
      }
    });
  });

  describe('Creación de Eventos', () => {
    test('crea un evento nuevo con tipos de entrada válidos', async () => {
      const nuevo = await apiService.createEvento({
        nombre: 'Festival de Primavera 2026',
        descripcion: 'Música en vivo y gastronomía al aire libre',
        categoriaId: 'cat-musica',
        fecha: '2026-10-15T18:00:00.000Z',
        ubicacion: 'Rosedal de Palermo',
        tiposEntrada: [
          { nombre: 'General', precio: 5000, cupo: 200 },
          { nombre: 'VIP', precio: 12000, cupo: 50 },
        ],
      });

      assert.ok(nuevo.id);
      assert.strictEqual(nuevo.nombre, 'Festival de Primavera 2026');
      assert.strictEqual(nuevo.precioMinimo, 5000);
      assert.strictEqual(nuevo.tiposEntrada.length, 2);

      const eventoEnLista = await apiService.getEventoById(nuevo.id);
      assert.strictEqual(eventoEnLista.nombre, 'Festival de Primavera 2026');
    });

    test('falla al crear evento sin campos requeridos', async () => {
      await assert.rejects(
        () => apiService.createEvento({ nombre: '', descripcion: 'test' }),
        /El nombre del evento es obligatorio/
      );
    });

    test('falla al crear evento sin tipos de entrada válidos', async () => {
      await assert.rejects(
        () =>
          apiService.createEvento({
            nombre: 'Evento Test',
            descripcion: 'Desc',
            categoriaId: 'cat-musica',
            fecha: '2026-10-10',
            ubicacion: 'Lugar',
            tiposEntrada: [],
          }),
        /Debe definir al menos un tipo de entrada/
      );
    });
  });

  describe('Compras y Cupo', () => {
    test('realiza una compra y descuenta el cupo disponible', async () => {
      const eventoAntes = await apiService.getEventoById('ev-luna-park');
      const tipoAntes = eventoAntes.tiposEntrada.find(t => t.id === 't-lp-general');
      const cupoInicial = tipoAntes.cupoDisponible;

      const compra = await apiService.createCompra({
        compradorId: 'usr-comprador-1',
        eventoId: 'ev-luna-park',
        tipoEntradaId: 't-lp-general',
        cantidad: 2,
      });

      assert.ok(compra.id);
      assert.strictEqual(compra.cantidad, 2);
      assert.strictEqual(compra.precioTotal, tipoAntes.precio * 2);
      assert.strictEqual(compra.estado, 'CONFIRMADA');

      const eventoDespues = await apiService.getEventoById('ev-luna-park');
      const tipoDespues = eventoDespues.tiposEntrada.find(t => t.id === 't-lp-general');
      assert.strictEqual(tipoDespues.cupoDisponible, cupoInicial - 2);
    });

    test('rechaza compra si la cantidad solicitada supera el cupo disponible', async () => {
      await assert.rejects(
        () =>
          apiService.createCompra({
            compradorId: 'usr-comprador-1',
            eventoId: 'ev-luna-park',
            tipoEntradaId: 't-lp-vip',
            cantidad: 9999,
          }),
        /Cupo insuficiente/
      );
    });

    test('cancela compra y restituye el cupo disponible', async () => {
      // Tomamos una compra confirmada
      const compraAntes = await apiService.getCompraById('cmp-001');
      assert.strictEqual(compraAntes.estado, 'CONFIRMADA');

      const eventoAntes = await apiService.getEventoById(compraAntes.eventoId);
      const tipoAntes = eventoAntes.tiposEntrada.find(t => t.id === compraAntes.tipoEntradaId);
      const cupoAntes = tipoAntes.cupoDisponible;

      const cancelada = await apiService.cancelarCompra('cmp-001', 'usr-comprador-1');
      assert.strictEqual(cancelada.estado, 'CANCELADA');

      const eventoDespues = await apiService.getEventoById(compraAntes.eventoId);
      const tipoDespues = eventoDespues.tiposEntrada.find(t => t.id === compraAntes.tipoEntradaId);
      assert.strictEqual(tipoDespues.cupoDisponible, cupoAntes + compraAntes.cantidad);
    });

    test('impide cancelar una compra que ya fue utilizada o cancelada', async () => {
      // cmp-002 está UTILIZADA
      await assert.rejects(
        () => apiService.cancelarCompra('cmp-002', 'usr-comprador-1'),
        /No se puede cancelar una entrada que ya fue utilizada/
      );

      // cmp-003 está CANCELADA
      await assert.rejects(
        () => apiService.cancelarCompra('cmp-003', 'usr-comprador-1'),
        /La compra ya está cancelada/
      );
    });
  });

  describe('Chat de Compra', () => {
    test('agrega mensaje al chat de la compra', async () => {
      const msg = await apiService.enviarMensajeCompra('cmp-001', {
        remitenteId: 'usr-comprador-1',
        remitenteNombre: 'Martina',
        texto: '¿Se suspende por lluvia?',
        esComprador: true,
      });

      assert.ok(msg.id);
      assert.strictEqual(msg.texto, '¿Se suspende por lluvia?');

      const compra = await apiService.getCompraById('cmp-001');
      const ultimo = compra.mensajes[compra.mensajes.length - 1];
      assert.strictEqual(ultimo.texto, '¿Se suspende por lluvia?');
    });

    test('falla al enviar mensaje con texto vacío', async () => {
      await assert.rejects(
        () =>
          apiService.enviarMensajeCompra('cmp-001', {
            remitenteId: 'usr-comprador-1',
            texto: '   ',
          }),
        /El mensaje no puede estar vacío/
      );
    });
  });

  describe('Reseñas de Eventos', () => {
    test('permite crear reseña si el comprador tiene una compra UTILIZADA', async () => {
      // cmp-002 tiene comprador 'usr-comprador-1' y evento 'ev-teatro-funcion' con estado UTILIZADA
      const resenia = await apiService.crearResenia({
        compradorId: 'usr-comprador-1',
        compradorNombre: 'Martina G.',
        eventoId: 'ev-teatro-funcion',
        puntuacion: 5,
        detalle: 'Una puesta en escena sublime, sonido impecable!',
      });

      assert.ok(resenia.id);
      assert.strictEqual(resenia.puntuacion, 5);

      const lista = await apiService.getReseniasByEvento('ev-teatro-funcion');
      assert.ok(lista.some(r => r.id === resenia.id));
    });

    test('rechaza reseña si el comprador NO tiene una compra en estado UTILIZADA', async () => {
      // Para 'ev-jazz-rio', comprador-1 tiene cmp-003 en CANCELADA
      await assert.rejects(
        () =>
          apiService.crearResenia({
            compradorId: 'usr-comprador-1',
            compradorNombre: 'Martina G.',
            eventoId: 'ev-jazz-rio',
            puntuacion: 4,
            detalle: 'Buen evento',
          }),
        /Solo podés calificar un evento cuando tu entrada haya sido utilizada/
      );
    });

    test('valida puntuación entre 1 y 5', async () => {
      await assert.rejects(
        () =>
          apiService.crearResenia({
            compradorId: 'usr-comprador-1',
            eventoId: 'ev-teatro-funcion',
            puntuacion: 6,
            detalle: 'Buenísimo',
          }),
        /La puntuación debe ser un número entero entre 1 y 5/
      );
    });
  });

  describe('Favoritos', () => {
    test('agrega y remueve favoritos correctamente', async () => {
      const res1 = await apiService.toggleFavorito('usr-comprador-1', 'ev-jazz-rio');
      assert.strictEqual(res1.esFavorito, true);
      assert.ok(res1.favoritos.includes('ev-jazz-rio'));

      const res2 = await apiService.toggleFavorito('usr-comprador-1', 'ev-jazz-rio');
      assert.strictEqual(res2.esFavorito, false);
      assert.ok(!res2.favoritos.includes('ev-jazz-rio'));
    });
  });

  describe('Organizador', () => {
    test('obtiene estadísticas correctas del organizador', async () => {
      const stats = await apiService.getStatsOrganizador('usr-org-1');
      assert.ok(stats.eventosCount >= 3);
      assert.ok(stats.entradasVendidas >= 0);
      assert.ok(stats.entradasDisponibles > 0);
      assert.ok(stats.ingresosTotales >= 0);
    });

    test('obtiene conversaciones del organizador', async () => {
      const convs = await apiService.getConversacionesOrganizador('usr-org-1');
      assert.ok(Array.isArray(convs));
      assert.ok(convs.length > 0);
      const convConMensajes = convs.find(c => c.totalMensajes > 0);
      assert.ok(convConMensajes);
      assert.ok(convConMensajes.ultimoMensaje);
    });
  });
});
