import { notificacionService } from '../services/NotificacionService.js';
import { z } from 'zod';
import { validate } from './utils/validate.js';

export const crearNotificacionSchema = z.object({
    usuarioId: z.string().optional(),
    rolDestino: z.enum(['Comprador', 'Organizador']).default('Comprador'),
    tipo: z.string().min(1, 'El tipo de notificación es requerido'),
    titulo: z.string().trim().min(1, 'El título es requerido'),
    mensaje: z.string().trim().min(1, 'El mensaje es requerido'),
    entidadId: z.string().optional(),
});

export class NotificacionController {
    constructor(service = notificacionService) {
        this.service = service;
    }

    listar = async (req, res, next) => {
        try {
            const { usuarioId, rol, rolDestino, noLeidas } = req.query;
            const notificaciones = await this.service.listar({
                usuarioId,
                rolDestino: rolDestino || rol,
                noLeidas,
            });
            res.status(200).json(notificaciones);
        } catch (err) {
            next(err);
        }
    };

    marcarLeida = async (req, res, next) => {
        try {
            const { id } = req.params;
            const actualizada = await this.service.marcarLeida(id);
            res.status(200).json(actualizada);
        } catch (err) {
            next(err);
        }
    };

    marcarTodas = async (req, res, next) => {
        try {
            const { usuarioId, rol, rolDestino } = { ...req.query, ...req.body };
            const resultado = await this.service.marcarTodasLeidas({
                usuarioId,
                rolDestino: rolDestino || rol,
            });
            res.status(200).json(resultado);
        } catch (err) {
            next(err);
        }
    };

    conteoNoLeidas = async (req, res, next) => {
        try {
            const { usuarioId, rol, rolDestino } = req.query;
            const resultado = await this.service.conteoNoLeidas({
                usuarioId,
                rolDestino: rolDestino || rol,
            });
            res.status(200).json(resultado);
        } catch (err) {
            next(err);
        }
    };

    crear = async (req, res, next) => {
        try {
            const data = validate(crearNotificacionSchema, req.body);
            const creada = await this.service.crearNotificacion(data);
            res.status(201).json(creada);
        } catch (err) {
            next(err);
        }
    };
}

export const notificacionController = new NotificacionController();
