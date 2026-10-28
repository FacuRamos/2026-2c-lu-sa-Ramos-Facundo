import { z } from 'zod';
import { eventoService } from '../services/EventoService.js';
import { validate } from './utils/validate.js';

// Esquemas Zod en el Controller
const tipoEntradaInputSchema = z.object({
    id: z.string().trim().optional(),
    nombre: z.string({ required_error: 'El nombre del tipo de entrada es obligatorio' })
        .trim()
        .min(1, 'El nombre no puede estar vacío'),
    descripcion: z.string().trim().optional().default(''),
    precio: z.coerce.number({ required_error: 'El precio es obligatorio' })
        .min(0, 'El precio no puede ser negativo'),
    cupo: z.coerce.number({ required_error: 'El cupo es obligatorio' })
        .int('El cupo debe ser un número entero')
        .min(0, 'El cupo no puede ser negativo'),
    cupoDisponible: z.coerce.number().int().min(0).optional()
});

const crearEventoSchema = z.object({
    nombre: z.string({ required_error: 'El nombre del evento es obligatorio' })
        .trim()
        .min(1, 'El nombre no puede estar vacío'),
    descripcion: z.string({ required_error: 'La descripción del evento es obligatoria' })
        .trim()
        .min(1, 'La descripción no puede estar vacía'),
    categoriaId: z.string({ required_error: 'La categoría es obligatoria' })
        .trim()
        .min(1, 'La categoría no puede estar vacía'),
    organizadorId: z.string().trim().min(1, 'El organizador no puede estar vacío').optional(),
    fecha: z.string({ required_error: 'La fecha es obligatoria' })
        .refine(val => !isNaN(Date.parse(val)), { message: 'La fecha debe tener un formato válido (ISO o similar)' }),
    tiposEntrada: z.array(tipoEntradaInputSchema, {
        required_error: 'Debe incluir al menos un tipo de entrada'
    }).min(1, 'Debe incluir al menos un tipo de entrada'),
    multimedia: z.array(z.string().trim().min(1, 'El recurso multimedia no puede estar vacío')).optional().default([])
});

const buscarEventosQuerySchema = z.object({
    busqueda: z.string().trim().optional(),
    categoriaId: z.string().trim().optional(),
    precioMin: z.coerce.number().min(0, 'El precio mínimo no puede ser negativo').optional(),
    precioMax: z.coerce.number().min(0, 'El precio máximo no puede ser negativo').optional(),
    ordenarPor: z.enum(['precio', 'fecha', 'puntajeOrganizador']).optional(),
    direccion: z.enum(['asc', 'desc', 'ASC', 'DESC']).transform(d => d.toLowerCase()).optional().default('asc')
}).refine(data => {
    if (data.precioMin !== undefined && data.precioMax !== undefined) {
        return data.precioMin <= data.precioMax;
    }
    return true;
}, {
    message: 'El precio mínimo no puede ser mayor al precio máximo',
    path: ['precioMin']
});

export class EventoController {
    constructor(service = eventoService) {
        this.service = service;
    }

    crear = async (req, res, next) => {
        try {
            const data = validate(crearEventoSchema, req.body);
            if (!data.organizadorId && req.user?.sub) {
                data.organizadorId = req.user.sub;
            }
            if (!data.organizadorId) {
                data.organizadorId = 'usr-org-1';
            }
            const evento = await this.service.crearEvento(data);
            res.status(201).json(evento);
        } catch (err) {
            next(err);
        }
    };

    obtenerPorId = async (req, res, next) => {
        try {
            const evento = await this.service.obtenerPorId(req.params.id);
            res.status(200).json(evento);
        } catch (err) {
            next(err);
        }
    };

    buscar = async (req, res, next) => {
        try {
            const query = validate(buscarEventosQuerySchema, req.query);
            const eventos = await this.service.buscarEventos(query);
            res.status(200).json(eventos);
        } catch (err) {
            next(err);
        }
    };

    obtenerReseniasOrganizador = async (req, res, next) => {
        try {
            const resultado = await this.service.obtenerReseniasDeOrganizador(req.params.organizadorId);
            res.status(200).json(resultado);
        } catch (err) {
            next(err);
        }
    };

    obtenerComprasOrganizador = async (req, res, next) => {
        try {
            const orgId = req.params.organizadorId || req.user?.sub;
            const compras = await this.service.obtenerComprasOrganizador(orgId);
            res.status(200).json(compras);
        } catch (err) {
            next(err);
        }
    };

    obtenerStatsOrganizador = async (req, res, next) => {
        try {
            const orgId = req.params.organizadorId || req.user?.sub;
            const stats = await this.service.obtenerStatsOrganizador(orgId);
            res.status(200).json(stats);
        } catch (err) {
            next(err);
        }
    };

    obtenerConversacionesOrganizador = async (req, res, next) => {
        try {
            const orgId = req.params.organizadorId || req.user?.sub;
            const convs = await this.service.obtenerConversacionesOrganizador(orgId);
            res.status(200).json(convs);
        } catch (err) {
            next(err);
        }
    };
}

export const eventoController = new EventoController();
