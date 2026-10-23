import { z } from 'zod';
import { categoriaService } from '../services/CategoriaService.js';
import { validate } from './utils/validate.js';

// Esquema Zod en el Controller
const crearCategoriaSchema = z.object({
    nombre: z.string({ required_error: 'El nombre de la categoría es obligatorio' })
        .trim()
        .min(1, 'El nombre no puede estar vacío'),
    descripcion: z.string().trim().optional().default('')
});

export class CategoriaController {
    constructor(service = categoriaService) {
        this.service = service;
    }

    crear = async (req, res, next) => {
        try {
            const data = validate(crearCategoriaSchema, req.body);
            const categoria = await this.service.crearCategoria(data);
            res.status(201).json(categoria);
        } catch (err) {
            next(err);
        }
    };

    obtenerPorId = async (req, res, next) => {
        try {
            const categoria = await this.service.obtenerPorId(req.params.id);
            res.status(200).json(categoria);
        } catch (err) {
            next(err);
        }
    };

    listar = async (req, res, next) => {
        try {
            const categorias = await this.service.listarTodas();
            res.status(200).json(categorias);
        } catch (err) {
            next(err);
        }
    };
}

export const categoriaController = new CategoriaController();
