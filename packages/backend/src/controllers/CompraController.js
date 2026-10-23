import { z } from 'zod';
import { compraService } from '../services/CompraService.js';
import { validate } from './utils/validate.js';

// Esquemas Zod en el Controller
const crearCompraSchema = z.object({
    compradorId: z.string({ required_error: 'El compradorId es obligatorio' })
        .trim()
        .min(1, 'El compradorId no puede estar vacío'),
    eventoId: z.string({ required_error: 'El eventoId es obligatorio' })
        .trim()
        .min(1, 'El eventoId no puede estar vacío'),
    tipoEntradaId: z.string({ required_error: 'El tipoEntradaId es obligatorio' })
        .trim()
        .min(1, 'El tipoEntradaId no puede estar vacío'),
    cantidad: z.coerce.number({ required_error: 'La cantidad es obligatoria' })
        .int('La cantidad debe ser un entero positivo')
        .min(1, 'Debe comprar al menos una entrada')
});

const cancelarCompraSchema = z.object({
    usuarioId: z.string({ required_error: 'El usuarioId es obligatorio' })
        .trim()
        .min(1, 'El usuarioId no puede estar vacío'),
    motivo: z.string().trim().optional().default('Cancelación de compra'),
    conReembolso: z.boolean().optional().default(true)
});

const enviarMensajeSchema = z.object({
    usuarioId: z.string({ required_error: 'El usuarioId es obligatorio' })
        .trim()
        .min(1, 'El usuarioId no puede estar vacío'),
    mensaje: z.string({ required_error: 'El mensaje no puede estar vacío' })
        .trim()
        .min(1, 'El mensaje no puede estar vacío')
});

const marcarUtilizadaSchema = z.object({
    usuarioId: z.string({ required_error: 'El usuarioId es obligatorio' })
        .trim()
        .min(1, 'El usuarioId no puede estar vacío'),
    motivo: z.string().trim().optional().default('Entrada utilizada en el evento')
});

const obtenerComprasPorEventoQuerySchema = z.object({
    organizadorId: z.string({ required_error: 'El organizadorId es obligatorio' })
        .trim()
        .min(1, 'El organizadorId no puede estar vacío')
});

export class CompraController {
    constructor(service = compraService) {
        this.service = service;
    }

    realizarCompra = async (req, res, next) => {
        try {
            const data = validate(crearCompraSchema, req.body);
            const compra = await this.service.realizarCompra(data);
            res.status(201).json(compra);
        } catch (err) {
            next(err);
        }
    };

    obtenerPorId = async (req, res, next) => {
        try {
            const compra = await this.service.obtenerPorId(req.params.id);
            res.status(200).json(compra);
        } catch (err) {
            next(err);
        }
    };

    obtenerPorComprador = async (req, res, next) => {
        try {
            const compras = await this.service.obtenerComprasPorComprador(req.params.compradorId);
            res.status(200).json(compras);
        } catch (err) {
            next(err);
        }
    };

    obtenerPorEvento = async (req, res, next) => {
        try {
            const { organizadorId } = validate(obtenerComprasPorEventoQuerySchema, req.query);
            const resultado = await this.service.obtenerComprasPorEvento(req.params.eventoId, organizadorId);
            res.status(200).json(resultado);
        } catch (err) {
            next(err);
        }
    };

    cancelar = async (req, res, next) => {
        try {
            const data = validate(cancelarCompraSchema, req.body);
            const compra = await this.service.cancelarCompra(req.params.id, data);
            res.status(200).json(compra);
        } catch (err) {
            next(err);
        }
    };

    marcarUtilizada = async (req, res, next) => {
        try {
            const data = validate(marcarUtilizadaSchema, req.body);
            const compra = await this.service.marcarUtilizada(req.params.id, data);
            res.status(200).json(compra);
        } catch (err) {
            next(err);
        }
    };

    enviarMensaje = async (req, res, next) => {
        try {
            const data = validate(enviarMensajeSchema, req.body);
            const mensaje = await this.service.enviarMensaje(req.params.id, data);
            res.status(201).json(mensaje);
        } catch (err) {
            next(err);
        }
    };
}

export const compraController = new CompraController();
