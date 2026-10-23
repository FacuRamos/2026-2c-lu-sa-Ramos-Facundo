import { BaseInMemoryRepository } from './BaseInMemoryRepository.js';

export class EventoRepository extends BaseInMemoryRepository {
    constructor() {
        super('Evento');
    }

    async findByOrganizador(organizadorId) {
        if (!organizadorId) return [];
        return this.getAll(ev => {
            const orgId = typeof ev.organizador === 'object' ? ev.organizador?.id : ev.organizador;
            return orgId === organizadorId;
        });
    }

    async findByCategoria(categoriaId) {
        if (!categoriaId) return [];
        return this.getAll(ev => {
            const catId = typeof ev.categoria === 'object' ? ev.categoria?.id : ev.categoria;
            return catId === categoriaId;
        });
    }
}

export const eventoRepository = new EventoRepository();
