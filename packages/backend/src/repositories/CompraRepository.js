import { BaseInMemoryRepository } from './BaseInMemoryRepository.js';

export class CompraRepository extends BaseInMemoryRepository {
    constructor() {
        super('Compra');
    }

    async findByComprador(compradorId) {
        if (!compradorId) return [];
        return this.getAll(c => {
            const cId = typeof c.comprador === 'object' ? c.comprador?.id : c.comprador;
            return cId === compradorId;
        });
    }

    async findByEvento(eventoId) {
        if (!eventoId) return [];
        return this.getAll(c => {
            const evId = typeof c.evento === 'object' ? c.evento?.id : c.evento;
            return evId === eventoId;
        });
    }
}

export const compraRepository = new CompraRepository();
