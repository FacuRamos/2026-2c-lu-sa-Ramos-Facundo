import crypto from 'crypto';
import { DomainValidationError } from '../errors/DomainError.js';

export const TIPOS_NOTIFICACION = {
    COMPRA_CONFIRMADA: 'COMPRA_CONFIRMADA',
    CUENTA_REGRESIVA: 'CUENTA_REGRESIVA',
    NUEVO_MENSAJE_CHAT: 'NUEVO_MENSAJE_CHAT',
    RECORDATORIO_CALIFICAR: 'RECORDATORIO_CALIFICAR',
    NUEVA_VENTA: 'NUEVA_VENTA',
    CUPO_CRITICO: 'CUPO_CRITICO',
    COMPRA_CANCELADA: 'COMPRA_CANCELADA',
};

export class Notificacion {
    constructor({
        id = crypto.randomUUID(),
        usuarioId,
        rolDestino = 'Comprador',
        tipo,
        titulo,
        mensaje,
        leida = false,
        entidadId = null,
        fechaCreacion = new Date().toISOString()
    } = {}) {
        if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
            throw new DomainValidationError('El título de la notificación es obligatorio');
        }
        if (!mensaje || typeof mensaje !== 'string' || mensaje.trim().length === 0) {
            throw new DomainValidationError('El mensaje de la notificación es obligatorio');
        }
        if (!tipo) {
            throw new DomainValidationError('El tipo de notificación es obligatorio');
        }

        this.id = id;
        this.usuarioId = usuarioId || null;
        this.rolDestino = rolDestino === 'Organizador' ? 'Organizador' : 'Comprador';
        this.tipo = tipo;
        this.titulo = titulo.trim();
        this.mensaje = mensaje.trim();
        this.leida = Boolean(leida);
        this.entidadId = entidadId;
        this.fechaCreacion = typeof fechaCreacion === 'string' ? fechaCreacion : new Date(fechaCreacion).toISOString();
    }

    marcarComoLeida() {
        this.leida = true;
    }

    marcarComoNoLeida() {
        this.leida = false;
    }

    toJSON() {
        return {
            id: this.id,
            usuarioId: this.usuarioId,
            rolDestino: this.rolDestino,
            tipo: this.tipo,
            titulo: this.titulo,
            mensaje: this.mensaje,
            leida: this.leida,
            entidadId: this.entidadId,
            fechaCreacion: this.fechaCreacion
        };
    }
}
