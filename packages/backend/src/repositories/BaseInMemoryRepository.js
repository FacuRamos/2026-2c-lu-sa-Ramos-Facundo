import { EntityNotFoundError, DuplicateEntityError } from './errors/RepositoryError.js';

export class BaseInMemoryRepository {
    constructor(entityName = 'Entidad') {
        this.entityName = entityName;
        this.items = new Map();
    }

    async getAll(filterFn = null) {
        const values = Array.from(this.items.values());
        if (typeof filterFn === 'function') {
            return values.filter(filterFn);
        }
        return values;
    }

    async findById(id) {
        if (!id) return null;
        return this.items.get(id) || null;
    }

    async create(entity) {
        if (!entity || !entity.id) {
            throw new Error(`La entidad ${this.entityName} debe tener un identificador válido para guardarse`);
        }
        if (this.items.has(entity.id)) {
            throw new DuplicateEntityError(`${this.entityName} con id ${entity.id} ya existe`);
        }
        this.items.set(entity.id, entity);
        return entity;
    }

    async update(entity) {
        if (!entity || !entity.id) {
            throw new Error(`La entidad ${this.entityName} debe tener un identificador válido para actualizarse`);
        }
        if (!this.items.has(entity.id)) {
            throw new EntityNotFoundError(`${this.entityName} con id ${entity.id} no fue encontrada`);
        }
        this.items.set(entity.id, entity);
        return entity;
    }

    async delete(id) {
        if (!id || !this.items.has(id)) {
            throw new EntityNotFoundError(`${this.entityName} con id ${id} no fue encontrada para eliminar`);
        }
        return this.items.delete(id);
    }

    async clear() {
        this.items.clear();
    }

    async count() {
        return this.items.size;
    }
}
