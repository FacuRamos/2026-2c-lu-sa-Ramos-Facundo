import { BaseInMemoryRepository } from './BaseInMemoryRepository.js';

export class CategoriaRepository extends BaseInMemoryRepository {
    constructor() {
        super('Categoria');
    }

    async findByNombre(nombre) {
        if (!nombre) return null;
        const normalized = nombre.trim().toLowerCase();
        for (const cat of this.items.values()) {
            if (cat.nombre && cat.nombre.toLowerCase() === normalized) {
                return cat;
            }
        }
        return null;
    }
}

export const categoriaRepository = new CategoriaRepository();
