import { webApiCaller } from './client/webApiCaller.js';
import { NetworkError } from './client/apiError.js';
import { localStore } from './localStore.js';

export const reviewsService = {
  reset() {
    localStore.reset();
  },

  async getReseniasByEvento(eventoId) {
    try {
      return await webApiCaller.get(`/resenias/evento/${eventoId}`);
    } catch (err) {
      if (err instanceof NetworkError) {
        return localStore.reviews.filter((r) => r.eventoId === eventoId);
      }
      throw err;
    }
  },

  async getReseniasByOrganizador(organizadorId) {
    try {
      return await webApiCaller.get(`/resenias/organizador/${organizadorId}`);
    } catch (err) {
      if (err instanceof NetworkError) {
        return localStore.reviews.filter((r) => r.organizadorId === organizadorId);
      }
      throw err;
    }
  },

  async crearResenia({ compradorId, compradorNombre, eventoId, puntuacion, detalle }) {
    if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
      throw new Error('La puntuación debe ser un número entero entre 1 y 5');
    }

    try {
      return await webApiCaller.post('/resenias', {
        compradorId,
        compradorNombre,
        eventoId,
        puntuacion,
        detalle: detalle ? detalle.trim() : '',
      });
    } catch (err) {
      if (err instanceof NetworkError) {
        const tieneCompraUtilizada = localStore.purchases.some(
          (p) => p.compradorId === compradorId && p.eventoId === eventoId && p.estado === 'UTILIZADA'
        );

        if (!tieneCompraUtilizada) {
          throw new Error('Solo podés calificar un evento cuando tu entrada haya sido utilizada');
        }

        const nuevaResenia = {
          id: `res-${Date.now()}`,
          eventoId,
          compradorId,
          compradorNombre: compradorNombre || 'Comprador',
          puntuacion,
          detalle: detalle ? detalle.trim() : '',
          fecha: 'Recién',
        };

        localStore.reviews.unshift(nuevaResenia);
        return nuevaResenia;
      }
      throw err;
    }
  },
};
