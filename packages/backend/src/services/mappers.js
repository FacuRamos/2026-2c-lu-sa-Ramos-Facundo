/**
 * Mappers / DTOs de Salida para los Servicios.
 * Transforma las entidades de dominio ricas en objetos planos de respuesta,
 * evitando sobreexposición de datos (overfetching), fugas de privacidad (emails, favoritos)
 * y eliminando redundancias para clientes web y móviles (React Native).
 */

export function mapUsuarioDto(usuario) {
    if (!usuario) return null;
    return {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        nombreCompleto: usuario.nombreCompleto || `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim(),
        email: usuario.email || null,
        rol: usuario.rol || 'Comprador',
        nombreProductora: usuario.nombreProductora || null,
        razonSocial: usuario.razonSocial || null
    };
}

export function mapCategoriaDto(categoria) {
    if (!categoria) return null;
    return {
        id: categoria.id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion || ''
    };
}

export function mapEventoSummaryDto(evento) {
    if (!evento) return null;
    const cat = evento.categoria;
    const org = evento.organizador;
    const media = Array.isArray(evento.multimedia) && evento.multimedia.length > 0 ? evento.multimedia : [];
    const imagen = media[0] || evento.imagen || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85';
    const fechaObj = evento.fecha instanceof Date ? evento.fecha : (evento.fecha ? new Date(evento.fecha) : null);
    const fechaTexto = fechaObj && !isNaN(fechaObj.getTime())
        ? fechaObj.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · 20:30 hs'
        : 'Próximamente';

    return {
        id: evento.id,
        nombre: evento.nombre,
        descripcion: evento.descripcion,
        categoriaId: typeof cat === 'object' && cat !== null ? cat.id : cat,
        categoriaNombre: typeof cat === 'object' && cat !== null ? cat.nombre : null,
        fecha: fechaObj ? fechaObj.toISOString() : (evento.fecha || null),
        fechaTexto,
        ubicacion: evento.ubicacion || 'Buenos Aires',
        imagen,
        organizadorId: typeof org === 'object' && org !== null ? org.id : org,
        organizadorNombre: typeof org === 'object' && org !== null ? (org.nombreCompleto || org.nombre) : 'Organizador',
        precioMinimo: typeof evento.obtenerPrecioMinimo === 'function' ? evento.obtenerPrecioMinimo() : (evento.precioMinimo ?? null),
        precioMaximo: typeof evento.obtenerPrecioMaximo === 'function' ? evento.obtenerPrecioMaximo() : (evento.precioMaximo ?? null),
        entradasDisponiblesTotales: typeof evento.totalEntradasDisponibles === 'function' ? evento.totalEntradasDisponibles() : (evento.entradasDisponiblesTotales ?? 0),
        multimedia: media
    };
}

export function mapEventoDetailDto(evento) {
    if (!evento) return null;
    return {
        ...mapEventoSummaryDto(evento),
        tiposEntrada: (evento.tiposEntrada || []).map(t => ({
            id: t.id,
            nombre: t.nombre,
            descripcion: t.descripcion || '',
            precio: t.precio,
            cupo: t.cupo,
            cupoDisponible: t.cupoDisponible
        }))
    };
}

export function mapMensajeDto(mensaje) {
    if (!mensaje) return null;
    const u = mensaje.usuario;
    const uId = typeof u === 'object' && u !== null ? u.id : u;
    const emisorNombre = typeof u === 'object' && u !== null ? (u.nombreCompleto || u.nombre) : 'Usuario';
    const fechaEnvio = mensaje.enviado instanceof Date
        ? mensaje.enviado
        : (mensaje.enviado ? new Date(mensaje.enviado) : new Date());
    const fechaTexto = !isNaN(fechaEnvio.getTime())
        ? fechaEnvio.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        : '';

    return {
        id: mensaje.id,
        usuarioId: uId,
        remitenteId: uId,
        emisor: emisorNombre,
        remitenteNombre: emisorNombre,
        mensaje: mensaje.mensaje,
        texto: mensaje.mensaje,
        enviado: fechaEnvio.toISOString(),
        fecha: fechaTexto
    };
}

export function mapCompraDto(compra) {
    if (!compra) return null;
    const ev = compra.evento;
    const tipo = compra.tipoEntrada;
    const evObj = typeof ev === 'object' && ev !== null ? ev : {};
    const evFecha = evObj.fecha ? (evObj.fecha instanceof Date ? evObj.fecha : new Date(evObj.fecha)) : null;
    const diasFaltantes = typeof compra.diasParaElEvento === 'function' ? compra.diasParaElEvento() : null;
    const evMedia = Array.isArray(evObj.multimedia) && evObj.multimedia.length > 0 ? evObj.multimedia[0] : null;
    const img = evMedia || evObj.imagen || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85';
    const fechaTexto = evFecha && !isNaN(evFecha.getTime())
        ? evFecha.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · 20:30 hs'
        : 'Próximamente';

    return {
        id: compra.id,
        estado: compra.estado,
        diasFaltantesParaEvento: diasFaltantes,
        diasRestantes: diasFaltantes ?? 0,
        fechaCompra: compra.fechaCompra instanceof Date ? compra.fechaCompra.toISOString() : compra.fechaCompra,
        cantidad: compra.cantidad,
        total: compra.total,
        precioTotal: compra.total,
        eventoTitulo: evObj.nombre || 'Evento',
        eventoImagen: img,
        eventoFechaTexto: fechaTexto,
        eventoLugar: evObj.ubicacion || 'Buenos Aires',
        tipoEntradaNombre: typeof tipo === 'object' && tipo !== null ? tipo.nombre : 'Entrada',
        evento: {
            id: evObj.id || ev,
            nombre: evObj.nombre || 'Evento',
            fecha: evFecha ? evFecha.toISOString() : null,
            organizadorNombre: evObj.organizador
                ? (typeof evObj.organizador === 'object' ? (evObj.organizador.nombreCompleto || evObj.organizador.nombre) : 'Organizador')
                : 'Organizador'
        },
        entrada: {
            id: typeof tipo === 'object' && tipo !== null ? tipo.id : tipo,
            nombre: typeof tipo === 'object' && tipo !== null ? tipo.nombre : 'Entrada',
            precioUnitario: typeof tipo === 'object' && tipo !== null ? tipo.precio : null
        },
        mensajes: (compra.mensajes || []).map(mapMensajeDto)
    };
}

export function mapCompraOrganizadorItemDto(compra) {
    if (!compra) return null;
    const comp = compra.comprador;
    const tipo = compra.tipoEntrada;

    return {
        id: compra.id,
        compradorId: typeof comp === 'object' && comp !== null ? comp.id : comp,
        compradorNombre: typeof comp === 'object' && comp !== null
            ? (comp.nombreCompleto || `${comp.nombre || ''} ${comp.apellido || ''}`.trim())
            : 'Comprador',
        tipoEntradaId: typeof tipo === 'object' && tipo !== null ? tipo.id : tipo,
        tipoEntradaNombre: typeof tipo === 'object' && tipo !== null ? tipo.nombre : 'Entrada',
        cantidad: compra.cantidad,
        total: compra.total,
        estado: compra.estado,
        fechaCompra: compra.fechaCompra instanceof Date ? compra.fechaCompra.toISOString() : compra.fechaCompra
    };
}

export function mapDisponibilidadTipoDto(tipo) {
    if (!tipo) return null;
    return {
        tipoEntradaId: tipo.id,
        nombre: tipo.nombre,
        cupoTotal: tipo.cupo,
        cupoDisponible: tipo.cupoDisponible,
        vendidas: tipo.cupo - tipo.cupoDisponible
    };
}

export function mapComprasPorEventoDto(evento, compras = []) {
    if (!evento) return null;
    return {
        eventoId: evento.id,
        nombreEvento: evento.nombre,
        fechaEvento: evento.fecha instanceof Date ? evento.fecha.toISOString() : evento.fecha,
        disponibilidadPorTipo: (evento.tiposEntrada || []).map(mapDisponibilidadTipoDto),
        totalCompras: compras.length,
        compras: compras.map(mapCompraOrganizadorItemDto)
    };
}

export function mapReseniaDto(resenia) {
    if (!resenia) return null;
    const comp = resenia.comprador;
    const ev = resenia.evento;

    return {
        id: resenia.id,
        compradorId: typeof comp === 'object' && comp !== null ? comp.id : comp,
        compradorNombre: typeof comp === 'object' && comp !== null
            ? (comp.nombreCompleto || `${comp.nombre || ''} ${comp.apellido || ''}`.trim())
            : 'Comprador',
        eventoId: typeof ev === 'object' && ev !== null ? ev.id : ev,
        eventoNombre: typeof ev === 'object' && ev !== null ? ev.nombre : 'Evento',
        puntuacion: resenia.puntuacion,
        detalle: resenia.detalle,
        fecha: resenia.fecha instanceof Date ? resenia.fecha.toISOString() : resenia.fecha
    };
}

export function mapReseniaEventoItemDto(resenia) {
    if (!resenia) return null;
    const comp = resenia.comprador;
    return {
        id: resenia.id,
        compradorNombre: typeof comp === 'object' && comp !== null
            ? (comp.nombreCompleto || comp.nombre)
            : 'Comprador',
        puntuacion: resenia.puntuacion,
        detalle: resenia.detalle,
        fecha: resenia.fecha instanceof Date ? resenia.fecha.toISOString() : resenia.fecha
    };
}

export function mapEventoConDetalleYReseniasDto(evento, { puntajeOrganizador = 0, resenias = [] } = {}) {
    if (!evento) return null;
    return {
        ...mapEventoDetailDto(evento),
        puntajeOrganizador,
        resenias: resenias.map(mapReseniaEventoItemDto)
    };
}

export function mapResumenOrganizadorReseniasDto(organizador, resenias = [], puntajePromedio = 0) {
    if (!organizador) return null;
    return {
        organizadorId: organizador.id,
        organizadorNombre: organizador.nombreCompleto || organizador.nombre || 'Organizador',
        puntajePromedio,
        cantidadResenias: resenias.length,
        resenias: resenias.map(mapReseniaDto)
    };
}
