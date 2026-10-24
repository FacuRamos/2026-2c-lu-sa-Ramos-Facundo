import { webApiCaller } from './client/webApiCaller.js';
import { NetworkError } from './client/apiError.js';
import { localStore } from './localStore.js';

export const notificationsService = {
  reset() {
    localStore.reset();
  },

  async getNotificaciones({ usuarioId = null, rolDestino = null, noLeidas = false } = {}) {
    try {
      const query = {};
      if (usuarioId) query.usuarioId = usuarioId;
      if (rolDestino) query.rolDestino = rolDestino;
      if (noLeidas) query.noLeidas = true;

      return await webApiCaller.get('/notificaciones', { query });
    } catch (err) {
      if (err instanceof NetworkError) {
        let result = [...localStore.notificaciones];
        if (rolDestino) {
          result = result.filter((n) => n.rolDestino === rolDestino);
        }
        if (usuarioId) {
          result = result.filter((n) => !n.usuarioId || n.usuarioId === usuarioId);
        }
        if (noLeidas) {
          result = result.filter((n) => !n.leida);
        }
        return result.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
      }
      throw err;
    }
  },

  async marcarNotificacionLeida(id) {
    try {
      return await webApiCaller.patch(`/notificaciones/${id}/leida`);
    } catch (err) {
      if (err instanceof NetworkError) {
        const notif = localStore.notificaciones.find((n) => n.id === id);
        if (notif) {
          notif.leida = true;
        }
        return notif ? { ...notif } : null;
      }
      throw err;
    }
  },

  async marcarTodasNotificacionesLeidas({ usuarioId = null, rolDestino = null } = {}) {
    try {
      return await webApiCaller.patch('/notificaciones/marcar-todas', { usuarioId, rolDestino });
    } catch (err) {
      if (err instanceof NetworkError) {
        let count = 0;
        localStore.notificaciones.forEach((n) => {
          let match = true;
          if (rolDestino && n.rolDestino !== rolDestino) match = false;
          if (usuarioId && n.usuarioId && n.usuarioId !== usuarioId) match = false;
          if (match && !n.leida) {
            n.leida = true;
            count++;
          }
        });
        return { marcadas: count };
      }
      throw err;
    }
  },

  async getUnreadNotificacionesCount({ usuarioId = null, rolDestino = null } = {}) {
    try {
      const res = await webApiCaller.get('/notificaciones/conteo', {
        query: { usuarioId, rolDestino },
      });
      return typeof res.unreadCount === 'number' ? res.unreadCount : 0;
    } catch (err) {
      if (err instanceof NetworkError) {
        const list = await this.getNotificaciones({ usuarioId, rolDestino, noLeidas: true });
        return list.length;
      }
      throw err;
    }
  },

  async crearNotificacion(data) {
    try {
      return await webApiCaller.post('/notificaciones', data);
    } catch (err) {
      if (err instanceof NetworkError) {
        const nueva = {
          id: `notif-${Date.now()}`,
          usuarioId: data.usuarioId || null,
          rolDestino: data.rolDestino || 'Comprador',
          tipo: data.tipo,
          titulo: data.titulo,
          mensaje: data.mensaje,
          leida: false,
          entidadId: data.entidadId || null,
          fechaCreacion: new Date().toISOString(),
        };
        localStore.notificaciones.unshift(nueva);
        return { ...nueva };
      }
      throw err;
    }
  },
};
