import { BaseInMemoryRepository } from './BaseInMemoryRepository.js';

export class ReseniaRepository extends BaseInMemoryRepository {
    constructor() {
        super('Resenia');
    }

    async findByEvento(eventoId) {
        if (!eventoId) return [];
        return this.getAll(r => {
            const evId = typeof r.evento === 'object' ? r.evento?.id : r.evento;
            return evId === eventoId;
        });
    }

    async findByOrganizador(organizadorId) {
        if (!organizadorId) return [];
        return this.getAll(r => {
            const org = r.evento?.organizador || r.organizador;
            const orgId = typeof org === 'object' ? (org?.id || org?.organizadorId) : (org || r.organizadorId);
            return orgId === organizadorId;
        });
    }

    async findByCompradorYEvento(compradorId, eventoId) {
        if (!compradorId || !eventoId) return null;
        for (const res of this.items.values()) {
            const cId = typeof res.comprador === 'object' ? res.comprador?.id : res.comprador;
            const evId = typeof res.evento === 'object' ? res.evento?.id : res.evento;
            if (cId === compradorId && evId === eventoId) {
                return res;
            }
        }
        return null;
    }
}

export const reseniaRepository = new ReseniaRepository();
