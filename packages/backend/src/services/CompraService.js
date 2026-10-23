import { Compra } from '../domain/entities/compra.js';
import { EstadoCompra } from '../domain/enums/estadoCompra.js';
import { compraRepository as defaultCompraRepo } from '../repositories/CompraRepository.js';
import { eventoRepository as defaultEventoRepo } from '../repositories/EventoRepository.js';
import { usuarioRepository as defaultUsuarioRepo } from '../repositories/UsuarioRepository.js';
import { NotFoundError, BusinessRuleError, UnauthorizedError } from './errors/ServiceError.js';
import {
    mapCompraDto,
    mapComprasPorEventoDto,
    mapMensajeDto
} from './mappers.js';

export class CompraService {
    constructor({
        compraRepo = defaultCompraRepo,
        eventoRepo = defaultEventoRepo,
        usuarioRepo = defaultUsuarioRepo
    } = {}) {
        this.compraRepo = compraRepo;
        this.eventoRepo = eventoRepo;
        this.usuarioRepo = usuarioRepo;
    }

    async _obtenerEntidad(id) {
        const compra = await this.compraRepo.findById(id);
        if (!compra) {
            throw new NotFoundError(`Compra con id "${id}" no encontrada`);
        }
        return compra;
    }

    async realizarCompra(data) {
        const comprador = await this.usuarioRepo.findById(data.compradorId);
        if (!comprador) {
            throw new NotFoundError(`Usuario comprador con id "${data.compradorId}" no encontrado`);
        }

        const evento = await this.eventoRepo.findById(data.eventoId);
        if (!evento) {
            throw new NotFoundError(`Evento con id "${data.eventoId}" no encontrado`);
        }

        if (evento.yaSeRealizo()) {
            throw new BusinessRuleError('No se pueden comprar entradas para un evento que ya se ha realizado');
        }

        const tipoEntrada = evento.obtenerTipoEntrada(data.tipoEntradaId);
        if (!tipoEntrada) {
            throw new NotFoundError(`Tipo de entrada con id "${data.tipoEntradaId}" no encontrado en este evento`);
        }

        // Descuenta el cupo (lanza InsufficientCapacityError si excede)
        tipoEntrada.descontarCupo(data.cantidad);

        const compra = new Compra({
            comprador,
            evento,
            tipoEntrada,
            cantidad: data.cantidad,
            estado: EstadoCompra.CONFIRMADA
        });

        await this.compraRepo.create(compra);
        await this.eventoRepo.update(evento);

        return mapCompraDto(compra);
    }

    async obtenerPorId(id) {
        const compra = await this._obtenerEntidad(id);
        return mapCompraDto(compra);
    }

    async obtenerComprasPorComprador(compradorId) {
        const comprador = await this.usuarioRepo.findById(compradorId);
        if (!comprador) {
            throw new NotFoundError(`Usuario comprador con id "${compradorId}" no encontrado`);
        }

        const compras = await this.compraRepo.findByComprador(compradorId);
        return compras.map(mapCompraDto);
    }

    async obtenerComprasPorEvento(eventoId, organizadorId = null) {
        const evento = await this.eventoRepo.findById(eventoId);
        if (!evento) {
            throw new NotFoundError(`Evento con id "${eventoId}" no encontrado`);
        }

        if (!organizadorId) {
            throw new UnauthorizedError('Se requiere organizadorId para consultar las compras de un evento');
        }

        const evOrgId = typeof evento.organizador === 'object' ? evento.organizador?.id : evento.organizador;
        if (evOrgId !== organizadorId) {
            throw new UnauthorizedError('Solo el organizador del evento puede ver sus compras y disponibilidad');
        }

        const compras = await this.compraRepo.findByEvento(eventoId);
        return mapComprasPorEventoDto(evento, compras);
    }

    async cancelarCompra(compraId, data = {}) {
        const compra = await this._obtenerEntidad(compraId);

        const usuario = await this.usuarioRepo.findById(data.usuarioId);
        if (!usuario) {
            throw new NotFoundError(`Usuario con id "${data.usuarioId}" no encontrado`);
        }

        const compradorId = typeof compra.comprador === 'object' ? compra.comprador?.id : compra.comprador;
        const orgId = typeof compra.evento?.organizador === 'object'
            ? compra.evento.organizador.id
            : compra.evento?.organizador;

        if (usuario.id !== compradorId && usuario.id !== orgId) {
            throw new UnauthorizedError('Solo el comprador o el organizador pueden cancelar esta compra');
        }

        const conReembolso = data.conReembolso !== undefined ? data.conReembolso : true;
        const motivo = data.motivo || 'Cancelación de compra';
        compra.cancelar(usuario, new Date(), conReembolso, motivo);

        await this.compraRepo.update(compra);
        await this.eventoRepo.update(compra.evento);

        return mapCompraDto(compra);
    }

    async marcarUtilizada(compraId, data = {}) {
        const compra = await this._obtenerEntidad(compraId);

        if (!data.usuarioId) {
            throw new UnauthorizedError('Se requiere usuarioId del organizador para marcar la entrada como utilizada');
        }

        const usuario = await this.usuarioRepo.findById(data.usuarioId);
        if (!usuario) {
            throw new NotFoundError(`Usuario con id "${data.usuarioId}" no encontrado`);
        }
        const orgId = typeof compra.evento?.organizador === 'object'
            ? compra.evento.organizador.id
            : compra.evento?.organizador;
        if (usuario.id !== orgId) {
            throw new UnauthorizedError('Solo el organizador del evento puede marcar una entrada como utilizada');
        }

        const motivo = data.motivo || 'Entrada utilizada en el evento';
        compra.marcarUtilizada(usuario, new Date(), motivo);
        await this.compraRepo.update(compra);

        return mapCompraDto(compra);
    }

    async enviarMensaje(compraId, data = {}) {
        const compra = await this._obtenerEntidad(compraId);

        const usuario = await this.usuarioRepo.findById(data.usuarioId);
        if (!usuario) {
            throw new NotFoundError(`Usuario con id "${data.usuarioId}" no encontrado`);
        }

        const mensaje = compra.agregarMensaje(usuario, data.mensaje);
        await this.compraRepo.update(compra);

        return mapMensajeDto(mensaje);
    }
}

export const compraService = new CompraService();
