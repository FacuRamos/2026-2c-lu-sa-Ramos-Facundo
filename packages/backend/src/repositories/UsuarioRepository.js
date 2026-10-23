import { BaseInMemoryRepository } from './BaseInMemoryRepository.js';

export class UsuarioRepository extends BaseInMemoryRepository {
    constructor() {
        super('Usuario');
    }

    async findByEmail(email) {
        if (!email) return null;
        const normalized = email.trim().toLowerCase();
        for (const user of this.items.values()) {
            if (user.email && user.email.toLowerCase() === normalized) {
                return user;
            }
        }
        return null;
    }
}

export const usuarioRepository = new UsuarioRepository();
