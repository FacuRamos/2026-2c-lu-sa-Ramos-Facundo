import { Usuario } from '../domain/entities/usuario.js';
import { usuarioRepository as defaultRepo } from '../repositories/UsuarioRepository.js';
import { eventoRepository as defaultEventoRepo } from '../repositories/EventoRepository.js';
import { NotFoundError, ConflictError } from './errors/ServiceError.js';
import { mapUsuarioDto } from './mappers.js';

export class UsuarioService {
    constructor({ usuarioRepo = defaultRepo, eventoRepo = defaultEventoRepo } = {}) {
        this.usuarioRepo = usuarioRepo;
        this.eventoRepo = eventoRepo;
    }

    async _obtenerEntidad(id) {
        const usuario = await this.usuarioRepo.findById(id);
        if (!usuario) {
            throw new NotFoundError(`Usuario con id "${id}" no encontrado`);
        }
        return usuario;
    }

    async crearUsuario(data = {}) {
        if (data.email) {
            const existente = await this.usuarioRepo.findByEmail(data.email);
            if (existente) {
                throw new ConflictError(`Ya existe un usuario con el email "${data.email}"`);
            }
        }

        const usuario = new Usuario(data);
        await this.usuarioRepo.create(usuario);
        return mapUsuarioDto(usuario);
    }

    async obtenerPorId(id) {
        const usuario = await this._obtenerEntidad(id);
        return mapUsuarioDto(usuario);
    }

    async listarTodos() {
        const usuarios = await this.usuarioRepo.getAll();
        return usuarios.map(mapUsuarioDto);
    }

    async agregarFavorito(usuarioId, data = {}) {
        const eventoId = typeof data === 'object' ? data.eventoId : data;
        const usuario = await this._obtenerEntidad(usuarioId);
        const evento = await this.eventoRepo.findById(eventoId);
        if (!evento) {
            throw new NotFoundError(`Evento con id "${eventoId}" no encontrado para agregar a favoritos`);
        }

        usuario.agregarFavorito(evento);
        await this.usuarioRepo.update(usuario);
        return (usuario.favoritos || []).map(f => typeof f === 'object' ? f.id : f);
    }

    async eliminarFavorito(usuarioId, eventoId) {
        const usuario = await this._obtenerEntidad(usuarioId);
        const eliminado = usuario.eliminarFavorito(eventoId);
        if (eliminado) {
            await this.usuarioRepo.update(usuario);
        }
        return { eliminado, favoritos: (usuario.favoritos || []).map(f => typeof f === 'object' ? f.id : f) };
    }

    async listarFavoritos(usuarioId) {
        const usuario = await this._obtenerEntidad(usuarioId);
        return (usuario.favoritos || []).map(f => typeof f === 'object' ? f.id : f);
    }
}

export const usuarioService = new UsuarioService();
