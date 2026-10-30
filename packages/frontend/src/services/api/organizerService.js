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
      const res = await webApiCaller.get(`/eventos/organizador/${organizadorId}/conversaciones`);
      const list = Array.isArray(res) ? res : [];
      return list.map((c) => {
        const uMsg = c.ultimoMensaje;
        const msgText = uMsg ? (uMsg.texto || uMsg.mensaje || '') : '';
        const esComprador = uMsg ? (uMsg.esComprador ?? (uMsg.remitenteId === c.compradorId || uMsg.usuarioId === c.compradorId)) : false;
        const total = c.totalMensajes ?? c.totalMessages ?? (c.mensajes ? c.mensajes.length : 0);
        return {
          ...c,
          totalMensajes: total,
          totalMessages: total,
          ultimoMensaje: uMsg
            ? {
                ...uMsg,
                texto: msgText,
                mensaje: msgText,
                esComprador,
              }
            : null,
        };
      });
    } catch (err) {
      if (err instanceof NetworkError) {
        const compras = await this.getComprasByOrganizador(organizadorId);
        return compras.map((c) => {
          const uMsg = c.mensajes && c.mensajes.length > 0 ? c.mensajes[c.mensajes.length - 1] : null;
          const msgText = uMsg ? (uMsg.texto || uMsg.mensaje || '') : '';
          const esComprador = uMsg ? (uMsg.esComprador ?? (uMsg.remitenteId === c.compradorId || uMsg.usuarioId === c.compradorId)) : false;
          const total = (c.mensajes && c.mensajes.length) || 0;
          return {
            compraId: c.id,
            compradorNombre: c.compradorNombre,
            eventoTitulo: c.eventoTitulo,
            ultimoMensaje: uMsg
              ? {
                  ...uMsg,
                  texto: msgText,
                  mensaje: msgText,
                  esComprador,
                }
              : null,
            totalMessages: total,
            totalMensajes: total,
            tipoEntradaNombre: c.tipoEntradaNombre,
          };
        });
      }
      throw err;
    }
  },
};
