import { webApiCaller } from './client/webApiCaller.js';
import { NetworkError } from './client/apiError.js';
import { localStore } from './localStore.js';

export const purchasesService = {
  reset() {
    localStore.reset();
  },

  async getComprasByComprador(compradorId) {
    try {
      return await webApiCaller.get(`/compras/usuario/${compradorId}`);
    } catch (err) {
      if (err instanceof NetworkError) {
        return localStore.purchases
          .filter((p) => p.compradorId === compradorId)
          .sort((a, b) => new Date(b.fechaCompra) - new Date(a.fechaCompra));
      }
      throw err;
    }
  },

  async getCompraById(id) {
    try {
      return await webApiCaller.get(`/compras/${id}`);
    } catch (err) {
      if (err instanceof NetworkError) {
        const purchase = localStore.purchases.find((p) => p.id === id);
        if (!purchase) throw new Error(`Compra con id ${id} no encontrada`);
        return JSON.parse(JSON.stringify(purchase));
      }
      throw err;
    }
  },

  async createCompra({ compradorId, eventoId, tipoEntradaId, cantidad }) {
    if (!compradorId) throw new Error('El comprador es obligatorio');
    if (!eventoId) throw new Error('El evento es obligatorio');
    if (!tipoEntradaId) throw new Error('El tipo de entrada es obligatorio');
    if (!cantidad || cantidad <= 0) throw new Error('La cantidad debe ser mayor a 0');

    try {
      return await webApiCaller.post('/compras', {
        compradorId,
        eventoId,
        tipoEntradaId,
        cantidad,
      });
    } catch (err) {
      if (err instanceof NetworkError) {
        const event = localStore.events.find((e) => e.id === eventoId);
        if (!event) throw new Error(`Evento con id ${eventoId} no encontrado`);

        const tipo = event.tiposEntrada.find((t) => t.id === tipoEntradaId);
        if (!tipo) throw new Error(`Tipo de entrada con id ${tipoEntradaId} no encontrado`);

        if (tipo.cupoDisponible < cantidad) {
          throw new Error(`Cupo insuficiente: quedan ${tipo.cupoDisponible} entradas disponibles`);
        }

        tipo.cupoDisponible -= cantidad;

        const nuevaCompra = {
          id: `cmp-${Date.now()}`,
          compradorId,
          compradorNombre: 'Martina García',
          eventoId: event.id,
          eventoTitulo: event.nombre,
          eventoFecha: event.fecha,
          eventoLugar: event.ubicacion,
          eventoImagen: event.imagen,
          tipoEntradaId: tipo.id,
          tipoEntradaNombre: tipo.nombre,
          precioUnitario: tipo.precio,
          cantidad,
          precioTotal: tipo.precio * cantidad,
          estado: 'CONFIRMADA',
          fechaCompra: new Date().toISOString(),
          diasFaltantes: Math.max(0, Math.ceil((new Date(event.fecha) - new Date()) / (1000 * 60 * 60 * 24))),
          mensajes: [],
          historialEstados: [
            {
              estado: 'CONFIRMADA',
              fecha: new Date().toISOString(),
              motivo: 'Compra realizada exitosamente',
            },
          ],
        };

        localStore.purchases.unshift(nuevaCompra);
        return nuevaCompra;
      }
      throw err;
    }
  },

  async cancelarCompra(compraId, usuarioId) {
    try {
      return await webApiCaller.patch(`/compras/${compraId}/cancelar`, { usuarioId });
    } catch (err) {
      if (err instanceof NetworkError) {
        const compra = localStore.purchases.find((p) => p.id === compraId);
        if (!compra) throw new Error(`Compra con id ${compraId} no encontrada`);

        if (compra.estado === 'UTILIZADA') {
          throw new Error('No se puede cancelar una entrada que ya fue utilizada');
        }
        if (compra.estado === 'CANCELADA') {
          throw new Error('La compra ya está cancelada');
        }

        const evento = localStore.events.find((e) => e.id === compra.eventoId);
        if (evento) {
          const tipo = evento.tiposEntrada.find((t) => t.id === compra.tipoEntradaId);
          if (tipo) {
            tipo.cupoDisponible += compra.cantidad;
          }
        }

        compra.estado = 'CANCELADA';
        compra.historialEstados = compra.historialEstados || [];
        compra.historialEstados.push({
          estado: 'CANCELADA',
          fecha: new Date().toISOString(),
          motivo: 'Cancelada por el usuario',
        });

        return compra;
      }
      throw err;
    }
  },
};
