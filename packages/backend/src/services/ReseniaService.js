import { Resenia } from '../domain/entities/resenia.js';
import { reseniaRepository as defaultReseniaRepo } from '../repositories/ReseniaRepository.js';
import { usuarioRepository as defaultUsuarioRepo } from '../repositories/UsuarioRepository.js';
import { eventoRepository as defaultEventoRepo } from '../repositories/EventoRepository.js';
import { compraRepository as defaultCompraRepo } from '../repositories/CompraRepository.js';
import { NotFoundError, ConflictError } from './errors/ServiceError.js';
import { calcularPuntajeOrganizador } from '../domain/utils/eventoUtils.js';
import { mapReseniaDto, mapResumenOrganizadorReseniasDto } from './mappers.js';

export class ReseniaService {
    constructor({
        reseniaRepo = defaultReseniaRepo,
        usuarioRepo = defaultUsuarioRepo,
        eventoRepo = defaultEventoRepo,
        compraRepo = defaultCompraRepo
    } = {}) {
        this.reseniaRepo = reseniaRepo;
        this.usuarioRepo = usuarioRepo;
        this.eventoRepo = eventoRepo;
        this.compraRepo = compraRepo;
    }

    async crearResenia(data) {
        const comprador = await this.usuarioRepo.findById(data.compradorId);
        if (!comprador) {
            throw new NotFoundError(`Usuario comprador con id "${data.compradorId}" no encontrado`);
        }

        const evento = await this.eventoRepo.findById(data.eventoId);
        if (!evento) {
            throw new NotFoundError(`Evento con id "${data.eventoId}" no encontrado`);
        }

        let compra;
        if (data.compraId) {
            compra = await this.compraRepo.findById(data.compraId);
            if (!compra) {
                throw new NotFoundError(`Compra con id "${data.compraId}" no encontrada`);
            }
        } else {
            const compras = await this.compraRepo.findByComprador(comprador.id);
            compra = compras.find(c => {
                const cEvId = typeof c.evento === 'object' && c.evento !== null ? c.evento.id : (c.eventoId || c.evento);
                const cEst = typeof c.estado === 'object' && c.estado !== null ? c.estado.nombre : c.estado;
                return cEvId === data.eventoId && cEst === 'UTILIZADA';
            });
            if (!compra) {
                compra = compras.find(c => {
                    const cEvId = typeof c.evento === 'object' && c.evento !== null ? c.evento.id : (c.eventoId || c.evento);
                    return cEvId === data.eventoId;
                });
            }
            if (!compra) {
                throw new NotFoundError('No se encontró una compra asociada para calificar este evento');
            }
        }

        // Valida que la compra esté en estado UTILIZADA y corresponda al usuario y evento (CU9)
        Resenia.validarCompraHabilitaResenia(compra, comprador, evento);

        // Verifica si ya existe reseña de este comprador para este evento
        const reseniaExistente = await this.reseniaRepo.findByCompradorYEvento(comprador.id, evento.id);
        if (reseniaExistente) {
            throw new ConflictError('El comprador ya ha publicado una reseña para este evento');
        }

        const resenia = new Resenia({
            comprador,
            evento,
            detalle: data.detalle,
            puntuacion: data.puntuacion
        });

        await this.reseniaRepo.create(resenia);
        return mapReseniaDto(resenia);
    }

    async obtenerPorId(id) {
        const resenia = await this.reseniaRepo.findById(id);
        if (!resenia) {
            throw new NotFoundError(`Reseña con id "${id}" no encontrada`);
        }
        return mapReseniaDto(resenia);
    }

    async obtenerReseniasPorEvento(eventoId) {
        const evento = await this.eventoRepo.findById(eventoId);
        if (!evento) {
            throw new NotFoundError(`Evento con id "${eventoId}" no encontrado`);
        }

        const resenias = await this.reseniaRepo.findByEvento(eventoId);
        return resenias.map(mapReseniaDto);
    }

    async obtenerReseniasPorOrganizador(organizadorId) {
        const organizador = await this.usuarioRepo.findById(organizadorId);
        if (!organizador) {
            throw new NotFoundError(`Usuario organizador con id "${organizadorId}" no encontrado`);
        }

        const resenias = await this.reseniaRepo.findByOrganizador(organizadorId);
        const puntajePromedio = calcularPuntajeOrganizador(organizadorId, resenias);

        return mapResumenOrganizadorReseniasDto(organizador, resenias, puntajePromedio);
    }
}

export const reseniaService = new ReseniaService();
