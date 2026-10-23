import { Evento } from '../domain/entities/evento.js';
import { TipoEntrada } from '../domain/entities/tipoEntrada.js';
import { eventoRepository as defaultEventoRepo } from '../repositories/EventoRepository.js';
import { categoriaRepository as defaultCategoriaRepo } from '../repositories/CategoriaRepository.js';
import { usuarioRepository as defaultUsuarioRepo } from '../repositories/UsuarioRepository.js';
import { reseniaRepository as defaultReseniaRepo } from '../repositories/ReseniaRepository.js';
import { NotFoundError } from './errors/ServiceError.js';
import { filtrarEventos, ordenarEventos, calcularPuntajeOrganizador } from '../domain/utils/eventoUtils.js';
import { mapEventoDetailDto, mapEventoSummaryDto, mapEventoConDetalleYReseniasDto } from './mappers.js';

export class EventoService {
    constructor({
        eventoRepo = defaultEventoRepo,
        categoriaRepo = defaultCategoriaRepo,
        usuarioRepo = defaultUsuarioRepo,
        reseniaRepo = defaultReseniaRepo
    } = {}) {
        this.eventoRepo = eventoRepo;
        this.categoriaRepo = categoriaRepo;
        this.usuarioRepo = usuarioRepo;
        this.reseniaRepo = reseniaRepo;
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

        const evento = new Evento({
            nombre: data.nombre,
            descripcion: data.descripcion,
            categoria,
            organizador,
            fecha: data.fecha instanceof Date ? data.fecha : new Date(data.fecha),
            tiposEntrada,
            multimedia: data.multimedia || []
        });

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
            precioMax: queryParams.precioMax
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
}

export const eventoService = new EventoService();
