import { webApiCaller } from './client/webApiCaller.js';
import { NetworkError } from './client/apiError.js';
import { localStore } from './localStore.js';

export const organizerService = {
  reset() {
    localStore.reset();
  },

  async getComprasByOrganizador(organizadorId) {
    try {
      return await webApiCaller.get(`/eventos/organizador/${organizadorId}/compras`);
    } catch (err) {
      if (err instanceof NetworkError) {
        const misEventos = localStore.events.filter((e) => e.organizadorId === organizadorId);
        const misEventosIds = misEventos.map((e) => e.id);
        return localStore.purchases
          .filter((p) => misEventosIds.includes(p.eventoId))
          .sort((a, b) => new Date(b.fechaCompra) - new Date(a.fechaCompra));
      }
      throw err;
    }
  },

  async getStatsOrganizador(organizadorId) {
    try {
      return await webApiCaller.get(`/eventos/organizador/${organizadorId}/stats`);
    } catch (err) {
      if (err instanceof NetworkError) {
        const misEventos = localStore.events.filter((e) => e.organizadorId === organizadorId);
        const misEventosIds = misEventos.map((e) => e.id);
        const comprasOrg = localStore.purchases.filter((p) => misEventosIds.includes(p.eventoId));

        let entradasVendidas = 0;
        let ingresosTotales = 0;

        for (const compra of comprasOrg) {
          if (compra.estado !== 'CANCELADA') {
            entradasVendidas += compra.cantidad;
            ingresosTotales += compra.precioTotal;
          }
        }

        let entradasDisponibles = 0;
        for (const evento of misEventos) {
          for (const tipo of evento.tiposEntrada) {
            entradasDisponibles += tipo.cupoDisponible;
          }
        }

        return {
          eventosCount: misEventos.length,
          entradasVendidas,
          entradasDisponibles,
          ingresosTotales,
          eventos: misEventos,
        };
      }
      throw err;
    }
  },

  async getConversacionesOrganizador(organizadorId) {
    try {
      return await webApiCaller.get(`/eventos/organizador/${organizadorId}/conversaciones`);
    } catch (err) {
      if (err instanceof NetworkError) {
        const compras = await this.getComprasByOrganizador(organizadorId);
        return compras.map((c) => ({
          compraId: c.id,
          compradorNombre: c.compradorNombre,
          eventoTitulo: c.eventoTitulo,
          ultimoMensaje: c.mensajes && c.mensajes.length > 0 ? c.mensajes[c.mensajes.length - 1] : null,
          totalMensajes: (c.mensajes && c.mensajes.length) || 0,
          tipoEntradaNombre: c.tipoEntradaNombre,
        }));
      }
      throw err;
    }
  },
};
