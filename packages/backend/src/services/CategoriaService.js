import { Categoria } from '../domain/entities/categoria.js';
import { categoriaRepository as defaultRepo } from '../repositories/CategoriaRepository.js';
import { NotFoundError, ConflictError } from './errors/ServiceError.js';
import { mapCategoriaDto } from './mappers.js';

export class CategoriaService {
    constructor({ categoriaRepo = defaultRepo } = {}) {
        this.categoriaRepo = categoriaRepo;
    }

    async crearCategoria(data = {}) {
        const existente = await this.categoriaRepo.findByNombre(data.nombre);
        if (existente) {
            throw new ConflictError(`Ya existe una categoría con el nombre "${data.nombre}"`);
        }

        const categoria = new Categoria(data);
        await this.categoriaRepo.create(categoria);
        return mapCategoriaDto(categoria);
    }

    async obtenerPorId(id) {
        const categoria = await this.categoriaRepo.findById(id);
        if (!categoria) {
            throw new NotFoundError(`Categoría con id "${id}" no encontrada`);
        }
        return mapCategoriaDto(categoria);
    }

    async listarTodas() {
        const categorias = await this.categoriaRepo.getAll();
        return categorias.map(mapCategoriaDto);
    }
}

export const categoriaService = new CategoriaService();
