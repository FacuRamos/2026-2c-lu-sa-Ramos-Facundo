import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Usuario } from '../domain/entities/usuario.js';
import { usuarioRepository as defaultRepo } from '../repositories/UsuarioRepository.js';
import { ConflictError, UnauthorizedError, NotFoundError } from './errors/ServiceError.js';
import { mapUsuarioDto } from './mappers.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'dds-utn-jwt-secret-2026-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

export class AuthService {
    constructor({ usuarioRepo = defaultRepo } = {}) {
        this.usuarioRepo = usuarioRepo;
    }

    _generarTokens(usuario) {
        const payload = {
            sub: usuario.id,
            email: usuario.email,
            role: usuario.rol,
            rol: usuario.rol,
            nombreCompleto: usuario.nombreCompleto
        };

        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });

        const refreshToken = crypto.randomUUID();

        return { token, refreshToken };
    }

    async registrarComprador(data) {
        const existente = await this.usuarioRepo.findByEmail(data.email);
        if (existente) {
            throw new ConflictError(`El email "${data.email}" ya se encuentra registrado`);
        }

        const passwordHash = await Usuario.hashPassword(data.password);
        const usuario = new Usuario({
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email,
            password: passwordHash,
            rol: 'Comprador'
        });

        await this.usuarioRepo.create(usuario);
        const { token, refreshToken } = this._generarTokens(usuario);

        return {
            token,
            refreshToken,
            usuario: mapUsuarioDto(usuario)
        };
    }

    async registrarOrganizador(data) {
        const existente = await this.usuarioRepo.findByEmail(data.email);
        if (existente) {
            throw new ConflictError(`El email "${data.email}" ya se encuentra registrado`);
        }

        const passwordHash = await Usuario.hashPassword(data.password);
        const usuario = new Usuario({
            nombre: data.nombre,
            apellido: data.apellido,
            nombreProductora: data.nombreProductora,
            razonSocial: data.razonSocial || null,
            email: data.email,
            password: passwordHash,
            rol: 'Organizador'
        });

        await this.usuarioRepo.create(usuario);
        const { token, refreshToken } = this._generarTokens(usuario);

        return {
            token,
            refreshToken,
            usuario: mapUsuarioDto(usuario)
        };
    }

    async login({ email, password, rolSolicitado } = {}) {
        const usuario = await this.usuarioRepo.findByEmail(email);
        if (!usuario) {
            const err = new UnauthorizedError('Credenciales inválidas');
            err.status = 401;
            throw err;
        }

        const passwordValida = await usuario.verificarPassword(password);
        if (!passwordValida) {
            const err = new UnauthorizedError('Credenciales inválidas');
            err.status = 401;
            throw err;
        }

        if (rolSolicitado && usuario.rol !== rolSolicitado) {
            const err = new UnauthorizedError(`La cuenta no corresponde al rol ${rolSolicitado}`);
            err.status = 401;
            throw err;
        }

        const { token, refreshToken } = this._generarTokens(usuario);
        return {
            token,
            refreshToken,
            usuario: mapUsuarioDto(usuario)
        };
    }

    async loginDemo(rol = 'Comprador') {
        const isOrg = rol === 'Organizador';
        const demoId = isOrg ? 'usr-org-1' : 'usr-comprador-1';
        let usuario = await this.usuarioRepo.findById(demoId);

        if (!usuario) {
            const defaultHash = await Usuario.hashPassword('demo123');
            if (isOrg) {
                usuario = new Usuario({
                    id: demoId,
                    nombre: 'Luna',
                    apellido: 'Producciones',
                    nombreProductora: 'Luna Producciones',
                    email: 'contacto@lunaproducciones.com',
                    password: defaultHash,
                    rol: 'Organizador'
                });
            } else {
                usuario = new Usuario({
                    id: demoId,
                    nombre: 'Martina',
                    apellido: 'García',
                    email: 'martina.garcia@example.com',
                    password: defaultHash,
                    rol: 'Comprador'
                });
            }
            await this.usuarioRepo.create(usuario);
        }

        const { token, refreshToken } = this._generarTokens(usuario);
        return {
            token,
            refreshToken,
            usuario: mapUsuarioDto(usuario)
        };
    }

    async obtenerUsuarioActual(id) {
        const usuario = await this.usuarioRepo.findById(id);
        if (!usuario) {
            throw new NotFoundError('Usuario no encontrado');
        }
        return mapUsuarioDto(usuario);
    }
}

export const authService = new AuthService();
