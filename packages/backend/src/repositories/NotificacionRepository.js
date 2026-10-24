import { BaseInMemoryRepository } from './BaseInMemoryRepository.js';
import { Notificacion, TIPOS_NOTIFICACION } from '../domain/entities/notificacion.js';

export class NotificacionRepository extends BaseInMemoryRepository {
    constructor() {
        super('Notificacion');
        this.initDemoNotifications();
    }

    initDemoNotifications() {
        const demoNotifs = [
            new Notificacion({
                id: 'notif-1',
                usuarioId: 'usr-comprador-1',
                rolDestino: 'Comprador',
                tipo: TIPOS_NOTIFICACION.COMPRA_CONFIRMADA,
                titulo: '¡Compra confirmada!',
                mensaje: 'Tu compra para "Luna Park Sessions" ha sido procesada con éxito. Faltan 10 días.',
                leida: false,
                entidadId: 'cmp-1',
                fechaCreacion: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // hace 30 min
            }),
            new Notificacion({
                id: 'notif-2',
                usuarioId: 'usr-comprador-1',
                rolDestino: 'Comprador',
                tipo: TIPOS_NOTIFICACION.NUEVO_MENSAJE_CHAT,
                titulo: 'Nuevo mensaje del organizador',
                mensaje: 'Luna Producciones: "Hola Martina, las puertas abrirán a las 20:00 hs puntual."',
                leida: false,
                entidadId: 'cmp-1',
                fechaCreacion: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // hace 2 hs
            }),
            new Notificacion({
                id: 'notif-3',
                usuarioId: 'usr-org-1',
                rolDestino: 'Organizador',
                tipo: TIPOS_NOTIFICACION.NUEVA_VENTA,
                titulo: 'Nueva entrada vendida',
                mensaje: 'Martina García compró 2 entradas "Campo General" para Luna Park Sessions.',
                leida: false,
                entidadId: 'ev-luna-park',
                fechaCreacion: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            }),
            new Notificacion({
                id: 'notif-4',
                usuarioId: 'usr-org-1',
                rolDestino: 'Organizador',
                tipo: TIPOS_NOTIFICACION.CUPO_CRITICO,
                titulo: 'Cupo crítico (< 10%)',
                mensaje: 'Quedan solo 8 entradas de "Acceso VIP Front" para Luna Park Sessions.',
                leida: false,
                entidadId: 'ev-luna-park',
                fechaCreacion: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
            }),
        ];

        for (const n of demoNotifs) {
            this.items.set(n.id, n);
        }
    }

    async findByFiltros({ usuarioId, rolDestino, noLeidas } = {}) {
        const notificaciones = Array.from(this.items.values());
        return notificaciones
            .filter((n) => {
                if (usuarioId && n.usuarioId && n.usuarioId !== usuarioId) return false;
                if (rolDestino && n.rolDestino !== rolDestino) return false;
                if (noLeidas === true && n.leida) return false;
                return true;
            })
            .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    }

    async marcarComoLeida(id) {
        const notificacion = await this.findById(id);
        if (!notificacion) return null;
        notificacion.marcarComoLeida();
        await this.update(notificacion);
        return notificacion;
    }

    async marcarTodasComoLeidas({ usuarioId, rolDestino } = {}) {
        const lista = await this.findByFiltros({ usuarioId, rolDestino, noLeidas: true });
        for (const notif of lista) {
            notif.marcarComoLeida();
            await this.update(notif);
        }
        return lista.length;
    }

    async conteoNoLeidas({ usuarioId, rolDestino } = {}) {
        const lista = await this.findByFiltros({ usuarioId, rolDestino, noLeidas: true });
        return lista.length;
    }
}

export const notificacionRepository = new NotificacionRepository();
