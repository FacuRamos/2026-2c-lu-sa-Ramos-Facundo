import { z } from 'zod';
import { usuarioService } from '../services/UsuarioService.js';
import { validate } from './utils/validate.js';

// Esquemas de validación Zod en el Controller
const crearUsuarioSchema = z.object({
    nombre: z.string({ required_error: 'El nombre es obligatorio' })
        .trim()
        .min(1, 'El nombre no puede estar vacío'),
    apellido: z.string({ required_error: 'El apellido es obligatorio' })
        .trim()
        .min(1, 'El apellido no puede estar vacío'),
    email: z.string().trim().email('El formato de email no es válido').optional().or(z.literal(''))
});

const agregarFavoritoSchema = z.object({
    eventoId: z.string({ required_error: 'El eventoId es obligatorio' })
        .trim()
        .min(1, 'El eventoId no puede estar vacío')
});

export class UsuarioController {
    constructor(service = usuarioService) {
        this.service = service;
    }

    crear = async (req, res, next) => {
        try {
            const data = validate(crearUsuarioSchema, req.body);
            const usuario = await this.service.crearUsuario(data);
            res.status(201).json(usuario);
        } catch (err) {
            next(err);
        }
    };

    obtenerPorId = async (req, res, next) => {
        try {
            const usuario = await this.service.obtenerPorId(req.params.id);
            res.status(200).json(usuario);
        } catch (err) {
            next(err);
        }
    };

    listar = async (req, res, next) => {
        try {
            const usuarios = await this.service.listarTodos();
            res.status(200).json(usuarios);
        } catch (err) {
            next(err);
        }
    };

    agregarFavorito = async (req, res, next) => {
        try {
            const data = validate(agregarFavoritoSchema, req.body);
            const favoritos = await this.service.agregarFavorito(req.params.id, data);
            res.status(200).json({ favoritos });
        } catch (err) {
            next(err);
        }
    };

    eliminarFavorito = async (req, res, next) => {
        try {
            const resultado = await this.service.eliminarFavorito(req.params.id, req.params.eventoId);
            res.status(200).json(resultado);
        } catch (err) {
            next(err);
        }
    };

    listarFavoritos = async (req, res, next) => {
        try {
            const favoritos = await this.service.listarFavoritos(req.params.id);
            res.status(200).json(favoritos);
        } catch (err) {
            next(err);
        }
    };
}

export const usuarioController = new UsuarioController();
