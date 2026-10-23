import { z } from 'zod';
import { reseniaService } from '../services/ReseniaService.js';
import { validate } from './utils/validate.js';

// Esquema Zod en el Controller
const crearReseniaSchema = z.object({
    compradorId: z.string({ required_error: 'El compradorId es obligatorio' })
        .trim()
        .min(1, 'El compradorId no puede estar vacío'),
    eventoId: z.string({ required_error: 'El eventoId es obligatorio' })
        .trim()
        .min(1, 'El eventoId no puede estar vacío'),
    compraId: z.string({ required_error: 'El compraId es obligatorio' })
        .trim()
        .min(1, 'El compraId no puede estar vacío'),
    detalle: z.string({ required_error: 'El comentario de la reseña es obligatorio' })
        .trim()
        .min(1, 'El comentario no puede estar vacío'),
    puntuacion: z.coerce.number({ required_error: 'La puntuación es obligatoria' })
        .int('La puntuación debe ser un número entero')
        .min(1, 'La puntuación mínima es 1')
        .max(5, 'La puntuación máxima es 5')
});

export class ReseniaController {
    constructor(service = reseniaService) {
        this.service = service;
    }

    crear = async (req, res, next) => {
        try {
            const data = validate(crearReseniaSchema, req.body);
            const resenia = await this.service.crearResenia(data);
            res.status(201).json(resenia);
        } catch (err) {
            next(err);
        }
    };

    obtenerPorId = async (req, res, next) => {
        try {
            const resenia = await this.service.obtenerPorId(req.params.id);
            res.status(200).json(resenia);
        } catch (err) {
            next(err);
        }
    };

    obtenerPorEvento = async (req, res, next) => {
        try {
            const resenias = await this.service.obtenerReseniasPorEvento(req.params.eventoId);
            res.status(200).json(resenias);
        } catch (err) {
            next(err);
        }
    };

    obtenerPorOrganizador = async (req, res, next) => {
        try {
            const resultado = await this.service.obtenerReseniasPorOrganizador(req.params.organizadorId);
            res.status(200).json(resultado);
        } catch (err) {
            next(err);
        }
    };
}

export const reseniaController = new ReseniaController();
