import { z } from 'zod';
import { validate } from './utils/validate.js';
import { authService } from '../services/AuthService.js';

export const registroCompradorSchema = z.object({
  nombre: z.string({ required_error: 'El nombre es obligatorio' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string({ required_error: 'El apellido es obligatorio' })
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string({ required_error: 'El email es obligatorio' })
    .trim()
    .email('Formato de email inválido'),
  password: z.string({ required_error: 'La contraseña es obligatoria' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: z.literal('Comprador').default('Comprador'),
});

export const registroOrganizadorSchema = z.object({
  nombre: z.string({ required_error: 'El nombre del responsable es obligatorio' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string({ required_error: 'El apellido del responsable es obligatorio' })
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  nombreProductora: z.string({ required_error: 'El nombre de la productora es obligatorio' })
    .trim()
    .min(2, 'El nombre de la productora debe tener al menos 2 caracteres'),
  email: z.string({ required_error: 'El email es obligatorio' })
    .trim()
    .email('Formato de email inválido'),
  password: z.string({ required_error: 'La contraseña es obligatoria' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  razonSocial: z.string().trim().optional(),
  rol: z.literal('Organizador').default('Organizador'),
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'El email es obligatorio' })
    .trim()
    .email('Email inválido'),
  password: z.string({ required_error: 'La contraseña es obligatoria' })
    .min(1, 'La contraseña no puede estar vacía'),
  rolSolicitado: z.enum(['Comprador', 'Organizador']).optional(),
});

export class AuthController {
  constructor(service = authService) {
    this.service = service;
  }

  registrarComprador = async (req, res, next) => {
    try {
      const data = validate(registroCompradorSchema, req.body);
      const resultado = await this.service.registrarComprador(data);
      res.status(201).json(resultado);
    } catch (err) {
      next(err);
    }
  };

  registrarOrganizador = async (req, res, next) => {
    try {
      const data = validate(registroOrganizadorSchema, req.body);
      const resultado = await this.service.registrarOrganizador(data);
      res.status(201).json(resultado);
    } catch (err) {
      next(err);
    }
  };

  login = async (req, res, next) => {
    try {
      const data = validate(loginSchema, req.body);
      const resultado = await this.service.login(data);
      res.status(200).json(resultado);
    } catch (err) {
      next(err);
    }
  };

  loginDemo = async (req, res, next) => {
    try {
      const rol = req.body?.rol || req.query?.rol || 'Comprador';
      const resultado = await this.service.loginDemo(rol);
      res.status(200).json(resultado);
    } catch (err) {
      next(err);
    }
  };

  obtenerMe = async (req, res, next) => {
    try {
      const usuarioId = req.user?.sub;
      if (!usuarioId) {
        return res.status(401).json({ error: 'No autenticado', message: 'Token sin identificador de usuario' });
      }
      const usuario = await this.service.obtenerUsuarioActual(usuarioId);
      res.status(200).json(usuario);
    } catch (err) {
      next(err);
    }
  };
}

export const authController = new AuthController();
