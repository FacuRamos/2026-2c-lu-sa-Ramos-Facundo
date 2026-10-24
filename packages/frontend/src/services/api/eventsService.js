import { webApiCaller } from './client/webApiCaller.js';
import { NetworkError } from './client/apiError.js';
import { localStore } from './localStore.js';

export const eventsService = {
  reset() {
    localStore.reset();
  },

  async getCategorias() {
    try {
      return await webApiCaller.get('/categorias');
    } catch (err) {
      if (err instanceof NetworkError) {
        return [...localStore.categories];
      }
      throw err;
    }
  },

  async getEventos({ texto = '', categoriaId = 'all', ordenarPor = null, precioMin = null, precioMax = null } = {}) {
    try {
      const query = {};
      if (texto && texto.trim()) query.q = texto.trim();
      if (categoriaId && categoriaId !== 'all') query.categoriaId = categoriaId;
      if (precioMin !== null && precioMin !== undefined) query.precioMin = precioMin;
      if (precioMax !== null && precioMax !== undefined) query.precioMax = precioMax;
      if (ordenarPor) query.ordenarPor = ordenarPor;

      const events = await webApiCaller.get('/eventos', { query });
      return Array.isArray(events) ? events : [];
    } catch (err) {
      if (err instanceof NetworkError) {
        let result = [...localStore.events];

        if (texto && texto.trim()) {
          const q = texto.trim().toLowerCase();
          result = result.filter(
            (e) =>
              e.nombre.toLowerCase().includes(q) ||
              e.descripcion.toLowerCase().includes(q) ||
              e.ubicacion.toLowerCase().includes(q) ||
              (e.categoriaNombre && e.categoriaNombre.toLowerCase().includes(q))
          );
        }

        if (categoriaId && categoriaId !== 'all') {
          result = result.filter((e) => e.categoriaId === categoriaId);
        }

        if (precioMin !== null && precioMin !== undefined) {
          result = result.filter((e) => e.precioMinimo >= precioMin);
        }
        if (precioMax !== null && precioMax !== undefined) {
          result = result.filter((e) => e.precioMinimo <= precioMax);
        }

        if (ordenarPor) {
          switch (ordenarPor) {
            case 'precio_asc':
              result.sort((a, b) => a.precioMinimo - b.precioMinimo);
              break;
            case 'precio_desc':
              result.sort((a, b) => b.precioMinimo - a.precioMinimo);
              break;
            case 'fecha_asc':
              result.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
              break;
            case 'fecha_desc':
              result.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
              break;
            case 'puntaje_organizador':
              result.sort((a, b) => (b.organizadorPuntaje || 0) - (a.organizadorPuntaje || 0));
              break;
          }
        }
        return result;
      }
      throw err;
    }
  },

  async getEventoById(id) {
    try {
      return await webApiCaller.get(`/eventos/${id}`);
    } catch (err) {
      if (err instanceof NetworkError) {
        const ev = localStore.events.find((e) => e.id === id);
        if (!ev) throw new Error(`Evento con id ${id} no encontrado`);
        return JSON.parse(JSON.stringify(ev));
      }
      throw err;
    }
  },

  async createEvento(data) {
    if (!data.nombre || !data.nombre.trim()) throw new Error('El nombre del evento es obligatorio');
    if (!data.descripcion || !data.descripcion.trim()) throw new Error('La descripción es obligatoria');
    if (!data.categoriaId) throw new Error('La categoría es obligatoria');
    if (!data.fecha) throw new Error('La fecha es obligatoria');
    if (!data.ubicacion || !data.ubicacion.trim()) throw new Error('La ubicación es obligatoria');
    if (!data.tiposEntrada || data.tiposEntrada.length === 0) {
      throw new Error('Debe definir al menos un tipo de entrada');
    }

    try {
      return await webApiCaller.post('/eventos', data);
    } catch (err) {
      if (err instanceof NetworkError) {
        const cat = localStore.categories.find((c) => c.id === data.categoriaId);
        const precios = data.tiposEntrada.map((t) => Number(t.precio));
        const precioMinimo = Math.min(...precios);
        const nuevoEvento = {
          id: `ev-${Date.now()}`,
          ...data,
          categoriaNombre: cat ? cat.nombre : 'General',
          precioMinimo,
          destacado: false,
          organizadorPuntaje: 5.0,
          organizadorNombre: data.organizadorNombre || 'Luna Producciones',
          tiposEntrada: data.tiposEntrada.map((t, idx) => ({
            id: t.id || `tipo-${idx + 1}`,
            nombre: t.nombre,
            precio: Number(t.precio),
            cupo: Number(t.cupo),
            cupoDisponible: Number(t.cupo),
          })),
        };
        localStore.events.unshift(nuevoEvento);
        return nuevoEvento;
      }
      throw err;
    }
  },

  async toggleFavorito(compradorId, eventoId) {
    try {
      return await webApiCaller.post(`/usuarios/${compradorId}/favoritos`, { eventoId });
    } catch (err) {
      if (err instanceof NetworkError) {
        const user = localStore.users.find((u) => u.id === compradorId);
        if (!user) throw new Error('Usuario no encontrado');
        user.favoritos = user.favoritos || [];
        const index = user.favoritos.indexOf(eventoId);
        let esFavorito = false;
        if (index >= 0) {
          user.favoritos.splice(index, 1);
        } else {
          user.favoritos.push(eventoId);
          esFavorito = true;
        }
        return { esFavorito, favoritos: [...user.favoritos] };
      }
      throw err;
    }
  },

  async getFavoritos(compradorId) {
    try {
      return await webApiCaller.get(`/usuarios/${compradorId}/favoritos`);
    } catch (err) {
      if (err instanceof NetworkError) {
        const user = localStore.users.find((u) => u.id === compradorId);
        if (!user || !user.favoritos) return [];
        return localStore.events.filter((e) => user.favoritos.includes(e.id));
      }
      throw err;
    }
  },
};
