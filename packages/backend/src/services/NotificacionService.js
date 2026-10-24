import { notificacionRepository as defaultRepo } from '../repositories/NotificacionRepository.js';
import { Notificacion } from '../domain/entities/notificacion.js';
import { NotFoundError } from './errors/ServiceError.js';

export class NotificacionService {
    constructor({ notificacionRepo = defaultRepo } = {}) {
        this.notificacionRepo = notificacionRepo;
    }

    async listar({ usuarioId, rolDestino, noLeidas } = {}) {
        const notificaciones = await this.notificacionRepo.findByFiltros({
            usuarioId,
            rolDestino,
            noLeidas: noLeidas === 'true' || noLeidas === true,
        });
        return notificaciones.map((n) => n.toJSON());
    }

    async marcarLeida(id) {
        const notificacion = await this.notificacionRepo.marcarComoLeida(id);
        if (!notificacion) {
            throw new NotFoundError(`Notificación con id "${id}" no encontrada`);
        }
        return notificacion.toJSON();
    }

    async marcarTodasLeidas({ usuarioId, rolDestino } = {}) {
        const cantidad = await this.notificacionRepo.marcarTodasComoLeidas({ usuarioId, rolDestino });
        return { marcadas: cantidad };
    }

    async conteoNoLeidas({ usuarioId, rolDestino } = {}) {
        const cantidad = await this.notificacionRepo.conteoNoLeidas({ usuarioId, rolDestino });
        return { unreadCount: cantidad };
    }

    async crearNotificacion(data = {}) {
        const notificacion = new Notificacion(data);
        await this.notificacionRepo.create(notificacion);
        return notificacion.toJSON();
    }
}

export const notificacionService = new NotificacionService();
