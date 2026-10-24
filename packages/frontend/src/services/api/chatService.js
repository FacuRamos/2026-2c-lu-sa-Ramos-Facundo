import { webApiCaller } from './client/webApiCaller.js';
import { NetworkError } from './client/apiError.js';
import { localStore } from './localStore.js';

export const chatService = {
  reset() {
    localStore.reset();
  },

  async getMensajesCompra(compraId) {
    try {
      return await webApiCaller.get(`/compras/${compraId}/mensajes`);
    } catch (err) {
      if (err instanceof NetworkError) {
        const compra = localStore.purchases.find((p) => p.id === compraId);
        if (!compra) throw new Error(`Compra con id ${compraId} no encontrada`);
        return compra.mensajes || [];
      }
      throw err;
    }
  },

  async enviarMensajeCompra(compraId, { remitenteId, remitenteNombre, texto, esComprador = true }) {
    if (!texto || !texto.trim()) {
      throw new Error('El mensaje no puede estar vacío');
    }

    try {
      return await webApiCaller.post(`/compras/${compraId}/mensajes`, {
        remitenteId,
        remitenteNombre,
        texto: texto.trim(),
        esComprador,
      });
    } catch (err) {
      if (err instanceof NetworkError) {
        const compra = localStore.purchases.find((p) => p.id === compraId);
        if (!compra) throw new Error(`Compra con id ${compraId} no encontrada`);

        const nuevoMensaje = {
          id: `msg-${Date.now()}`,
          remitenteId,
          remitenteNombre: remitenteNombre || 'Usuario',
          texto: texto.trim(),
          fecha: new Date().toISOString(),
          esComprador,
        };

        compra.mensajes = compra.mensajes || [];
        compra.mensajes.push(nuevoMensaje);
        return nuevoMensaje;
      }
      throw err;
    }
  },
};
