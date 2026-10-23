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
        email: usuario.email || null
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

    return {
        id: evento.id,
        nombre: evento.nombre,
        descripcion: evento.descripcion,
        categoriaId: typeof cat === 'object' && cat !== null ? cat.id : cat,
        categoriaNombre: typeof cat === 'object' && cat !== null ? cat.nombre : null,
        fecha: evento.fecha instanceof Date ? evento.fecha.toISOString() : evento.fecha,
        organizadorId: typeof org === 'object' && org !== null ? org.id : org,
        organizadorNombre: typeof org === 'object' && org !== null ? (org.nombreCompleto || org.nombre) : 'Organizador',
        precioMinimo: typeof evento.obtenerPrecioMinimo === 'function' ? evento.obtenerPrecioMinimo() : (evento.precioMinimo ?? null),
        precioMaximo: typeof evento.obtenerPrecioMaximo === 'function' ? evento.obtenerPrecioMaximo() : (evento.precioMaximo ?? null),
        entradasDisponiblesTotales: typeof evento.totalEntradasDisponibles === 'function' ? evento.totalEntradasDisponibles() : (evento.entradasDisponiblesTotales ?? 0),
        multimedia: evento.multimedia || []
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
    return {
        id: mensaje.id,
        usuarioId: typeof u === 'object' && u !== null ? u.id : u,
        emisor: typeof u === 'object' && u !== null ? (u.nombreCompleto || u.nombre) : 'Usuario',
        mensaje: mensaje.mensaje,
        enviado: mensaje.enviado instanceof Date ? mensaje.enviado.toISOString() : mensaje.enviado
    };
}

export function mapCompraDto(compra) {
    if (!compra) return null;
    const ev = compra.evento;
    const tipo = compra.tipoEntrada;

    return {
        id: compra.id,
        estado: compra.estado,
        diasFaltantesParaEvento: typeof compra.diasParaElEvento === 'function' ? compra.diasParaElEvento() : null,
        fechaCompra: compra.fechaCompra instanceof Date ? compra.fechaCompra.toISOString() : compra.fechaCompra,
        cantidad: compra.cantidad,
        total: compra.total,
        evento: {
            id: typeof ev === 'object' && ev !== null ? ev.id : ev,
            nombre: typeof ev === 'object' && ev !== null ? ev.nombre : 'Evento',
            fecha: typeof ev === 'object' && ev !== null && ev.fecha
                ? (ev.fecha instanceof Date ? ev.fecha.toISOString() : ev.fecha)
                : null,
            organizadorNombre: typeof ev === 'object' && ev !== null && typeof ev.organizador === 'object' && ev.organizador !== null
                ? (ev.organizador.nombreCompleto || ev.organizador.nombre)
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
