import { webApiCaller } from './client/webApiCaller.js';
import { NetworkError } from './client/apiError.js';
import { localStore } from './localStore.js';
import { secureStoreService, SECURE_KEYS } from '../secureStoreService.js';

export function adaptCompra(dto) {
  if (!dto) return null;
  const ev = dto.evento || {};
  const tipo = dto.entrada || {};
  const evFecha = ev.fecha ? new Date(ev.fecha) : null;
  const horaStr = evFecha && !isNaN(evFecha.getTime())
    ? evFecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '';
  const fechaTexto = dto.eventoFechaTexto || ev.fechaTexto || (evFecha && !isNaN(evFecha.getTime())
    ? `${evFecha.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })} · ${horaStr} hs`
    : 'Próximamente');

  const total = Number(dto.precioTotal ?? dto.total ?? 0);
  const dias = dto.diasRestantes ?? dto.diasFaltantesParaEvento ?? 0;

  return {
    ...dto,
    id: dto.id,
    estado: dto.estado,
    compradorId: dto.compradorId || dto.comprador?.id || dto.comprador,
    compradorNombre: dto.compradorNombre || dto.comprador?.nombreCompleto || dto.comprador?.nombre || 'Comprador',
    eventoId: dto.eventoId || ev.id || dto.evento,
    eventoTitulo: dto.eventoTitulo || ev.nombre || 'Evento',
    eventoImagen: dto.eventoImagen || ev.multimedia?.[0] || ev.imagen || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85',
    eventoFechaTexto: fechaTexto,
    eventoLugar: dto.eventoLugar || ev.ubicacion || 'Buenos Aires',
    tipoEntradaId: dto.tipoEntradaId || tipo.id || dto.tipoEntrada,
    tipoEntradaNombre: dto.tipoEntradaNombre || tipo.nombre || 'General',
    precioUnitario: Number(dto.precioUnitario ?? tipo.precioUnitario ?? (dto.cantidad ? total / dto.cantidad : 0)),
    cantidad: Number(dto.cantidad ?? 1),
    total,
    precioTotal: total,
    diasRestantes: dias,
    diasFaltantesParaEvento: dias,
    mensajes: (dto.mensajes || []).map((m) => {
      const uId = m.remitenteId || m.usuarioId;
      const uNombre = m.remitenteNombre || m.emisor || 'Usuario';
      const mFecha = m.fecha || (m.enviado ? new Date(m.enviado).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '');
      return {
        ...m,
        id: m.id,
        remitenteId: uId,
        usuarioId: uId,
        remitenteNombre: uNombre,
        emisor: uNombre,
        texto: m.texto || m.mensaje || '',
        mensaje: m.mensaje || m.texto || '',
        fecha: mFecha,
      };
    }),
  };
}

export const purchasesService = {
  reset() {
    localStore.reset();
  },

  async getComprasByComprador(compradorId) {
    try {
      const res = await webApiCaller.get(`/compras/usuario/${compradorId}`);
      return Array.isArray(res) ? res.map(adaptCompra) : [];
    } catch (err) {
      if (err instanceof NetworkError) {
        return localStore.purchases
          .filter((p) => p.compradorId === compradorId)
          .sort((a, b) => new Date(b.fechaCompra) - new Date(a.fechaCompra))
          .map(adaptCompra);
      }
      throw err;
    }
  },

  async getCompraById(id) {
    try {
      const res = await webApiCaller.get(`/compras/${id}`);
      return adaptCompra(res);
    } catch (err) {
      if (err instanceof NetworkError) {
        const purchase = localStore.purchases.find((p) => p.id === id);
        if (!purchase) throw new Error(`Compra con id ${id} no encontrada`);
        return adaptCompra(JSON.parse(JSON.stringify(purchase)));
      }
      throw err;
    }
  },

  async getComprasByEvento(eventoId, organizadorId = null) {
    try {
      let orgId = organizadorId;
      if (!orgId) {
        const storedUser = await secureStoreService.getObject(SECURE_KEYS.USER_DATA);
        if (storedUser?.id) {
          orgId = storedUser.id;
        }
      }
      const query = orgId ? { organizadorId: orgId } : {};
      const res = await webApiCaller.get(`/compras/evento/${eventoId}`, { query });
      const rawList = Array.isArray(res) ? res : (res?.compras || []);
      return rawList.map(adaptCompra);
    } catch (err) {
      if (err instanceof NetworkError) {
        return localStore.purchases.filter((p) => p.eventoId === eventoId).map(adaptCompra);
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
      const res = await webApiCaller.post('/compras', {
        compradorId,
        eventoId,
        tipoEntradaId,
        cantidad,
      });
      return adaptCompra(res);
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
      const res = await webApiCaller.post(`/compras/${compraId}/cancelar`, { usuarioId });
      return adaptCompra(res);
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

        return adaptCompra(compra);
      }
      throw err;
    }
  },

  async marcarUtilizada(compraId, usuarioId) {
    try {
      const res = await webApiCaller.post(`/compras/${compraId}/utilizar`, { usuarioId });
      return adaptCompra(res);
    } catch (err) {
      if (err instanceof NetworkError) {
        const compra = localStore.purchases.find((p) => p.id === compraId);
        if (!compra) throw new Error(`Compra con id ${compraId} no encontrada`);

        if (compra.estado !== 'CONFIRMADA') {
          throw new Error(`Solo se puede marcar como utilizada una compra CONFIRMADA`);
        }

        compra.estado = 'UTILIZADA';
        compra.historialEstados = compra.historialEstados || [];
        compra.historialEstados.push({
          estado: 'UTILIZADA',
          fecha: new Date().toISOString(),
          motivo: 'Entrada utilizada en el evento',
        });

        return adaptCompra(compra);
      }
      throw err;
    }
  },
};
