import {
  INITIAL_CATEGORIES,
  INITIAL_USERS,
  INITIAL_EVENTS,
  INITIAL_PURCHASES,
  INITIAL_REVIEWS,
} from '../data/mockData.js';

class ApiService {
  constructor() {
    this.reset();
  }

  reset() {
    this.categories = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.events = JSON.parse(JSON.stringify(INITIAL_EVENTS));
    this.purchases = JSON.parse(JSON.stringify(INITIAL_PURCHASES));
    this.reviews = JSON.parse(JSON.stringify(INITIAL_REVIEWS));
  }

  // --- CATEGORIAS ---
  async getCategorias() {
    return [...this.categories];
  }

  // --- EVENTOS ---
  async getEventos({ texto = '', categoriaId = 'all', ordenarPor = null, precioMin = null, precioMax = null } = {}) {
    let result = [...this.events];

    // Filtro por texto
    if (texto && texto.trim()) {
      const q = texto.trim().toLowerCase();
      result = result.filter(e =>
        e.nombre.toLowerCase().includes(q) ||
        e.descripcion.toLowerCase().includes(q) ||
        e.ubicacion.toLowerCase().includes(q) ||
        (e.categoriaNombre && e.categoriaNombre.toLowerCase().includes(q))
      );
    }

    // Filtro por categoria
    if (categoriaId && categoriaId !== 'all') {
      result = result.filter(e => e.categoriaId === categoriaId);
    }

    // Filtro por rango de precio
    if (precioMin !== null && precioMin !== undefined) {
      result = result.filter(e => e.precioMinimo >= precioMin);
    }
    if (precioMax !== null && precioMax !== undefined) {
      result = result.filter(e => e.precioMinimo <= precioMax);
    }

    // Ordenamiento
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
        default:
          break;
      }
    }

    return result;
  }

  async getEventoById(id) {
    const event = this.events.find(e => e.id === id);
    if (!event) throw new Error(`Evento con id ${id} no encontrado`);
    return JSON.parse(JSON.stringify(event));
  }

  async createEvento(data) {
    if (!data.nombre || !data.nombre.trim()) throw new Error('El nombre del evento es obligatorio');
    if (!data.descripcion || !data.descripcion.trim()) throw new Error('La descripción es obligatoria');
    if (!data.categoriaId) throw new Error('La categoría es obligatoria');
    if (!data.fecha) throw new Error('La fecha es obligatoria');
    if (!data.ubicacion || !data.ubicacion.trim()) throw new Error('La ubicación es obligatoria');
    if (!data.tiposEntrada || data.tiposEntrada.length === 0) {
      throw new Error('Debe definir al menos un tipo de entrada');
    }

    for (const t of data.tiposEntrada) {
      if (!t.nombre || !t.nombre.trim()) throw new Error('Cada tipo de entrada debe tener un nombre');
      if (Number(t.precio) <= 0) throw new Error('El precio debe ser mayor a 0');
      if (Number(t.cupo) <= 0) throw new Error('El cupo debe ser mayor a 0');
    }

    const cat = this.categories.find(c => c.id === data.categoriaId);
    const tipos = data.tiposEntrada.map((t, index) => ({
      id: t.id || `t-${Date.now()}-${index}`,
      nombre: t.nombre.trim(),
      precio: Number(t.precio),
      cupo: Number(t.cupo),
      cupoDisponible: Number(t.cupo),
    }));

    const precioMinimo = Math.min(...tipos.map(t => t.precio));

    const nuevoEvento = {
      id: `ev-${Date.now()}`,
      nombre: data.nombre.trim(),
      descripcion: data.descripcion.trim(),
      categoriaId: data.categoriaId,
      categoriaNombre: cat ? cat.nombre : 'Varios',
      organizadorId: data.organizadorId || 'usr-org-1',
      organizadorNombre: data.organizadorNombre || 'Luna Producciones',
      organizadorPuntaje: 4.9,
      organizadorIniciales: 'LP',
      fecha: data.fecha,
      fechaTexto: data.fechaTexto || 'Próximamente',
      ubicacion: data.ubicacion.trim(),
      direccion: data.direccion || data.ubicacion.trim(),
      imagen: data.imagen || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85',
      precioMinimo,
      destacado: false,
      paraVos: false,
      tiposEntrada: tipos,
    };

    this.events.unshift(nuevoEvento);
    return nuevoEvento;
  }

  async updateTiposEntrada(eventoId, tiposEntrada) {
    if (!eventoId) throw new Error('ID de evento requerido');
    if (!tiposEntrada || tiposEntrada.length === 0) {
      throw new Error('Debe existir al menos un tipo de entrada');
    }

    const evento = this.events.find(e => e.id === eventoId);
    if (!evento) throw new Error(`Evento con id ${eventoId} no encontrado`);

    for (const t of tiposEntrada) {
      if (!t.nombre || !t.nombre.trim()) throw new Error('Cada tipo de entrada debe tener un nombre');
      if (isNaN(Number(t.precio)) || Number(t.precio) <= 0) throw new Error('El precio debe ser mayor a 0');
      if (isNaN(Number(t.cupo)) || Number(t.cupo) <= 0) throw new Error('El cupo debe ser mayor a 0');
    }

    evento.tiposEntrada = tiposEntrada.map((t, idx) => {
      const existing = (evento.tiposEntrada || []).find(e => e.id === t.id);
      const vendidas = existing ? Math.max(0, existing.cupo - existing.cupoDisponible) : 0;
      const nuevoCupo = Number(t.cupo);
      const nuevoCupoDisponible = Math.max(0, nuevoCupo - vendidas);

      return {
        id: t.id || `t-${Date.now()}-${idx}`,
        nombre: t.nombre.trim(),
        precio: Number(t.precio),
        cupo: nuevoCupo,
        cupoDisponible: nuevoCupoDisponible,
      };
    });

    evento.precioMinimo = Math.min(...evento.tiposEntrada.map(t => t.precio));
    return JSON.parse(JSON.stringify(evento));
  }

  // --- COMPRAS ---
  async getComprasByComprador(compradorId) {
    return this.purchases.filter(p => p.compradorId === compradorId);
  }

  async getComprasByOrganizador(organizadorId) {
    // Compras de eventos organizados por este usuario
    const eventIds = this.events.filter(e => e.organizadorId === organizadorId).map(e => e.id);
    return this.purchases.filter(p => eventIds.includes(p.eventoId));
  }

  async getComprasByEvento(eventoId) {
    return this.purchases.filter(p => p.eventoId === eventoId);
  }

  async getCompraById(id) {
    const purchase = this.purchases.find(p => p.id === id);
    if (!purchase) throw new Error(`Compra con id ${id} no encontrada`);
    return JSON.parse(JSON.stringify(purchase));
  }

  async createCompra({ compradorId, eventoId, tipoEntradaId, cantidad }) {
    if (!compradorId) throw new Error('ID de comprador requerido');
    if (!eventoId) throw new Error('ID de evento requerido');
    if (!tipoEntradaId) throw new Error('Tipo de entrada requerido');
    if (!cantidad || cantidad <= 0) throw new Error('La cantidad debe ser mayor a 0');

    const evento = this.events.find(e => e.id === eventoId);
    if (!evento) throw new Error('Evento no encontrado');

    const tipo = evento.tiposEntrada.find(t => t.id === tipoEntradaId);
    if (!tipo) throw new Error('Tipo de entrada no encontrado en el evento');

    if (cantidad > tipo.cupoDisponible) {
      throw new Error(`Cupo insuficiente. Disponibles: ${tipo.cupoDisponible}`);
    }

    // Descontar cupo
    tipo.cupoDisponible -= cantidad;

    const user = this.users.find(u => u.id === compradorId);
    const compradorNombre = user ? `${user.nombre} ${user.apellido}` : 'Comprador';

    // Calcular días restantes aproximados
    const eventDate = new Date(evento.fecha);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diasRestantes = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const nuevaCompra = {
      id: `cmp-${Date.now()}`,
      compradorId,
      compradorNombre,
      eventoId: evento.id,
      eventoTitulo: evento.nombre,
      eventoImagen: evento.imagen,
      eventoFechaTexto: evento.fechaTexto,
      eventoLugar: `${evento.ubicacion} · ${evento.direccion || 'Buenos Aires'}`,
      tipoEntradaId: tipo.id,
      tipoEntradaNombre: tipo.nombre,
      precioUnitario: tipo.precio,
      cantidad,
      precioTotal: tipo.precio * cantidad,
      estado: 'CONFIRMADA',
      fechaCompra: new Date().toISOString(),
      diasRestantes,
      mensajes: [],
    };

    this.purchases.unshift(nuevaCompra);
    return nuevaCompra;
  }

  async createMultipleCompras({ compradorId, eventoId, items }) {
    if (!compradorId) throw new Error('ID de comprador requerido');
    if (!eventoId) throw new Error('ID de evento requerido');
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Debe seleccionar al menos una entrada');
    }

    const evento = this.events.find(e => e.id === eventoId);
    if (!evento) throw new Error('Evento no encontrado');

    // Validar disponibilidad de todos antes de descontar nada
    for (const item of items) {
      const tipo = evento.tiposEntrada.find(t => t.id === item.tipoEntradaId);
      if (!tipo) throw new Error(`Tipo de entrada no encontrado`);
      if (item.cantidad <= 0) throw new Error('La cantidad debe ser mayor a 0');
      if (item.cantidad > tipo.cupoDisponible) {
        throw new Error(`Cupo insuficiente para ${tipo.nombre}. Disponibles: ${tipo.cupoDisponible}`);
      }
    }

    const creadas = [];
    for (const item of items) {
      const compra = await this.createCompra({
        compradorId,
        eventoId,
        tipoEntradaId: item.tipoEntradaId,
        cantidad: item.cantidad,
      });
      creadas.push(compra);
    }

    return creadas;
  }

  async cancelarCompra(compraId, usuarioId) {
    const compra = this.purchases.find(p => p.id === compraId);
    if (!compra) throw new Error('Compra no encontrada');

    if (compra.estado === 'CANCELADA') {
      throw new Error('La compra ya está cancelada');
    }
    if (compra.estado === 'UTILIZADA') {
      throw new Error('No se puede cancelar una entrada que ya fue utilizada');
    }

    // Restituir cupo al evento
    const evento = this.events.find(e => e.id === compra.eventoId);
    if (evento) {
      const tipo = evento.tiposEntrada.find(t => t.id === compra.tipoEntradaId);
      if (tipo) {
        tipo.cupoDisponible = Math.min(tipo.cupo, tipo.cupoDisponible + compra.cantidad);
      }
    }

    compra.estado = 'CANCELADA';
    return compra;
  }

  async enviarMensajeCompra(compraId, { remitenteId, remitenteNombre, texto, esComprador }) {
    if (!texto || !texto.trim()) throw new Error('El mensaje no puede estar vacío');

    const compra = this.purchases.find(p => p.id === compraId);
    if (!compra) throw new Error('Compra no encontrada');

    const now = new Date();
    const hora = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} hs`;

    const nuevoMensaje = {
      id: `msg-${Date.now()}`,
      remitenteId,
      remitenteNombre: remitenteNombre || 'Usuario',
      texto: texto.trim(),
      fecha: hora,
      esComprador: Boolean(esComprador),
    };

    compra.mensajes = compra.mensajes || [];
    compra.mensajes.push(nuevoMensaje);
    return nuevoMensaje;
  }

  // --- RESEÑAS ---
  async getReseniasByEvento(eventoId) {
    return this.reviews.filter(r => r.eventoId === eventoId);
  }

  async crearResenia({ compradorId, compradorNombre, eventoId, puntuacion, detalle }) {
    if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
      throw new Error('La puntuación debe ser un número entero entre 1 y 5');
    }
    if (!detalle || !detalle.trim()) {
      throw new Error('El comentario de la reseña es obligatorio');
    }

    // Regla de negocio: sólo se puede calificar si el usuario tiene una compra UTILIZADA para ese evento
    const tieneEntradaUtilizada = this.purchases.some(
      p => p.compradorId === compradorId && p.eventoId === eventoId && p.estado === 'UTILIZADA'
    );

    if (!tieneEntradaUtilizada) {
      throw new Error('Solo podés calificar un evento cuando tu entrada haya sido utilizada');
    }

    const nuevaResenia = {
      id: `res-${Date.now()}`,
      eventoId,
      compradorId,
      compradorNombre: compradorNombre || 'Usuario',
      puntuacion: Math.round(puntuacion),
      detalle: detalle.trim(),
      fecha: 'Reciente',
    };

    this.reviews.unshift(nuevaResenia);

    // Actualizar puntaje promedio del evento y organizador
    const reseñasEvento = this.reviews.filter(r => r.eventoId === eventoId);
    const promedio = (
      reseñasEvento.reduce((sum, r) => sum + r.puntuacion, 0) / reseñasEvento.length
    ).toFixed(1);

    const evento = this.events.find(e => e.id === eventoId);
    if (evento) {
      evento.organizadorPuntaje = Number(promedio);
    }

    return nuevaResenia;
  }

  // --- FAVORITOS ---
  async toggleFavorito(compradorId, eventoId) {
    const user = this.users.find(u => u.id === compradorId);
    if (!user) throw new Error('Usuario no encontrado');

    user.favoritos = user.favoritos || [];
    const index = user.favoritos.indexOf(eventoId);
    let esFavorito = false;

    if (index >= 0) {
      user.favoritos.splice(index, 1);
      esFavorito = false;
    } else {
      user.favoritos.push(eventoId);
      esFavorito = true;
    }

    return { esFavorito, favoritos: [...user.favoritos] };
  }

  async getFavoritos(compradorId) {
    const user = this.users.find(u => u.id === compradorId);
    if (!user || !user.favoritos) return [];
    return this.events.filter(e => user.favoritos.includes(e.id));
  }

  // --- STATS ORGANIZADOR ---
  async getStatsOrganizador(organizadorId) {
    const misEventos = this.events.filter(e => e.organizadorId === organizadorId);
    const misEventosIds = misEventos.map(e => e.id);
    const comprasOrg = this.purchases.filter(p => misEventosIds.includes(p.eventoId));

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

  // --- CONVERSACIONES ORGANIZADOR ---
  async getConversacionesOrganizador(organizadorId) {
    const compras = await this.getComprasByOrganizador(organizadorId);
    // Filtrar aquellas con mensajes o disponibles para chat
    return compras.map(c => ({
      compraId: c.id,
      compradorNombre: c.compradorNombre,
      eventoTitulo: c.eventoTitulo,
      ultimoMensaje: c.mensajes && c.mensajes.length > 0 ? c.mensajes[c.mensajes.length - 1] : null,
      totalMensajes: (c.mensajes && c.mensajes.length) || 0,
      tipoEntradaNombre: c.tipoEntradaNombre,
    }));
  }
}

export const apiService = new ApiService();
