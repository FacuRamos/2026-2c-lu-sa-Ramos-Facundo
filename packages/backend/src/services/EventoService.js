import { Evento } from '../domain/entities/evento.js';
import { TipoEntrada } from '../domain/entities/tipoEntrada.js';
import { eventoRepository as defaultEventoRepo } from '../repositories/EventoRepository.js';
import { categoriaRepository as defaultCategoriaRepo } from '../repositories/CategoriaRepository.js';
import { usuarioRepository as defaultUsuarioRepo } from '../repositories/UsuarioRepository.js';
import { reseniaRepository as defaultReseniaRepo } from '../repositories/ReseniaRepository.js';
import { compraRepository as defaultCompraRepo } from '../repositories/CompraRepository.js';
import { NotFoundError } from './errors/ServiceError.js';
import { filtrarEventos, ordenarEventos, calcularPuntajeOrganizador } from '../domain/utils/eventoUtils.js';
import { mapEventoDetailDto, mapEventoSummaryDto, mapEventoConDetalleYReseniasDto } from './mappers.js';

export class EventoService {
    constructor({
        eventoRepo = defaultEventoRepo,
        categoriaRepo = defaultCategoriaRepo,
        usuarioRepo = defaultUsuarioRepo,
        reseniaRepo = defaultReseniaRepo,
        compraRepo = defaultCompraRepo
    } = {}) {
        this.eventoRepo = eventoRepo;
        this.categoriaRepo = categoriaRepo;
        this.usuarioRepo = usuarioRepo;
        this.reseniaRepo = reseniaRepo;
        this.compraRepo = compraRepo;
    }

    async crearEvento(data) {
        const categoria = await this.categoriaRepo.findById(data.categoriaId);
        if (!categoria) {
            throw new NotFoundError(`Categoría con id "${data.categoriaId}" no encontrada`);
        }

        const organizador = await this.usuarioRepo.findById(data.organizadorId);
        if (!organizador) {
            throw new NotFoundError(`Usuario organizador con id "${data.organizadorId}" no encontrado`);
        }

        const tiposEntrada = Array.isArray(data.tiposEntrada)
            ? data.tiposEntrada.map(t => new TipoEntrada(t))
            : [];

        const multimedia = Array.isArray(data.multimedia) && data.multimedia.length > 0
            ? data.multimedia
            : (data.imagen ? [data.imagen] : []);

        const evento = new Evento({
            nombre: data.nombre,
            descripcion: data.descripcion,
            categoria,
            organizador,
            fecha: data.fecha instanceof Date ? data.fecha : new Date(data.fecha),
            tiposEntrada,
            multimedia
        });
        if (data.ubicacion) {
            evento.ubicacion = data.ubicacion;
        }

        await this.eventoRepo.create(evento);
        return mapEventoDetailDto(evento);
    }

    async obtenerPorId(id) {
        const evento = await this.eventoRepo.findById(id);
        if (!evento) {
            throw new NotFoundError(`Evento con id "${id}" no encontrado`);
        }

        const resenias = await this.reseniaRepo.getAll();
        const orgId = typeof evento.organizador === 'object' ? evento.organizador?.id : evento.organizador;
        const puntajeOrganizador = calcularPuntajeOrganizador(orgId, resenias);
        const reseniasEvento = await this.reseniaRepo.findByEvento(id);

        return mapEventoConDetalleYReseniasDto(evento, {
            puntajeOrganizador,
            resenias: reseniasEvento
        });
    }

    async buscarEventos(queryParams = {}) {
        const todos = await this.eventoRepo.getAll();
        const resenias = await this.reseniaRepo.getAll();

        const filtrados = filtrarEventos(todos, {
            busqueda: queryParams.busqueda,
            categoriaId: queryParams.categoriaId,
            precioMin: queryParams.precioMin,
            precioMax: queryParams.precioMax,
            organizadorId: queryParams.organizadorId
        });

        const ordenados = ordenarEventos(filtrados, {
            criterio: queryParams.ordenarPor || 'fecha',
            direccion: queryParams.direccion || 'asc',
            resenias
        });

        return ordenados.map(ev => {
            const orgId = typeof ev.organizador === 'object' ? ev.organizador?.id : ev.organizador;
            const puntajeOrganizador = calcularPuntajeOrganizador(orgId, resenias);
            const dto = mapEventoSummaryDto(ev);
            return {
                ...dto,
                puntajeOrganizador
            };
        });
    }

    async obtenerReseniasDeOrganizador(organizadorId) {
        const org = await this.usuarioRepo.findById(organizadorId);
        if (!org) {
            throw new NotFoundError(`Usuario organizador con id "${organizadorId}" no encontrado`);
        }

        const resenias = await this.reseniaRepo.findByOrganizador(organizadorId);
        const puntajePromedio = calcularPuntajeOrganizador(organizadorId, resenias);

        return {
            organizadorId: org.id,
            organizadorNombre: org.nombreCompleto || `${org.nombre || ''} ${org.apellido || ''}`.trim(),
            puntajePromedio,
            cantidadResenias: resenias.length,
            resenias: resenias.map(r => ({
                id: r.id,
                eventoId: typeof r.evento === 'object' ? r.evento?.id : r.evento,
                eventoNombre: typeof r.evento === 'object' ? r.evento?.nombre : 'Evento',
                compradorNombre: typeof r.comprador === 'object' ? (r.comprador?.nombreCompleto || r.comprador?.nombre) : 'Comprador',
                puntuacion: r.puntuacion,
                detalle: r.detalle,
                fecha: r.fecha instanceof Date ? r.fecha.toISOString() : r.fecha
            }))
        };
    }

    async obtenerComprasOrganizador(organizadorId) {
        const eventos = await this.eventoRepo.getAll();
        const misEventos = eventos.filter(e => {
            const orgId = typeof e.organizador === 'object' && e.organizador ? e.organizador.id : e.organizador;
            return orgId === organizadorId;
        });
        const misEventosIds = new Set(misEventos.map(e => e.id));

        const todasCompras = await this.compraRepo.getAll();
        const comprasOrg = todasCompras.filter(c => {
            const evId = typeof c.evento === 'object' && c.evento ? c.evento.id : c.evento;
            return misEventosIds.has(evId);
        });

        return comprasOrg.map(c => {
            const comp = c.comprador;
            const ev = c.evento;
            const tipo = c.tipoEntrada;
            return {
                id: c.id,
                compradorId: typeof comp === 'object' && comp ? comp.id : comp,
                compradorNombre: typeof comp === 'object' && comp ? (comp.nombreCompleto || `${comp.nombre || ''} ${comp.apellido || ''}`.trim()) : 'Comprador',
                eventoId: typeof ev === 'object' && ev ? ev.id : ev,
                eventoTitulo: typeof ev === 'object' && ev ? ev.nombre : 'Evento',
                tipoEntradaId: typeof tipo === 'object' && tipo ? tipo.id : tipo,
                tipoEntradaNombre: typeof tipo === 'object' && tipo ? tipo.nombre : 'Entrada',
                cantidad: c.cantidad,
                total: c.total,
                precioTotal: c.total,
                estado: c.estado,
                fechaCompra: c.fechaCompra instanceof Date ? c.fechaCompra.toISOString() : c.fechaCompra,
                mensajes: (c.mensajes || []).map(m => ({
                    id: m.id,
                    usuarioId: typeof m.usuario === 'object' && m.usuario ? m.usuario.id : m.usuario,
                    emisor: typeof m.usuario === 'object' && m.usuario ? (m.usuario.nombreCompleto || m.usuario.nombre) : 'Usuario',
                    mensaje: m.mensaje,
                    enviado: m.enviado instanceof Date ? m.enviado.toISOString() : m.enviado
                }))
            };
        });
    }

    async obtenerStatsOrganizador(organizadorId) {
        const compras = await this.obtenerComprasOrganizador(organizadorId);
        const eventos = await this.eventoRepo.getAll();
        const misEventos = eventos.filter(e => {
            const orgId = typeof e.organizador === 'object' && e.organizador ? e.organizador.id : e.organizador;
            return orgId === organizadorId;
        });

        let entradasVendidas = 0;
        let ingresosTotales = 0;
        for (const c of compras) {
            if (c.estado !== 'CANCELADA') {
                entradasVendidas += c.cantidad || 0;
                ingresosTotales += c.total || c.precioTotal || 0;
            }
        }

        let entradasDisponibles = 0;
        for (const e of misEventos) {
            for (const t of (e.tiposEntrada || [])) {
                entradasDisponibles += (t.cupoDisponible !== undefined ? t.cupoDisponible : t.cupo) || 0;
            }
        }

        return {
            eventosCount: misEventos.length,
            entradasVendidas,
            entradasDisponibles,
            ingresosTotales,
            eventos: misEventos.map(mapEventoSummaryDto)
        };
    }

    async obtenerConversacionesOrganizador(organizadorId) {
        const compras = await this.obtenerComprasOrganizador(organizadorId);
        return compras.map(c => ({
            compraId: c.id,
            compradorNombre: c.compradorNombre,
            eventoTitulo: c.eventoTitulo,
            ultimoMensaje: c.mensajes && c.mensajes.length > 0 ? c.mensajes[c.mensajes.length - 1] : null,
            totalMensajes: (c.mensajes && c.mensajes.length) || 0,
            tipoEntradaNombre: c.tipoEntradaNombre
        }));
    }
}

export const eventoService = new EventoService();
