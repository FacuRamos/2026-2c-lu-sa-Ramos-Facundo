import crypto from "crypto";
import { DomainValidationError } from "../errors/DomainError.js";

export class Usuario {
    constructor({
        id = crypto.randomUUID(),
        nombre,
        apellido,
        email = null,
        password = null,
        rol = "Comprador",
        nombreProductora = null,
        razonSocial = null,
        favoritos = []
    } = {}) {
        if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
            throw new DomainValidationError("El nombre del usuario es obligatorio");
        }
        if (!apellido || typeof apellido !== "string" || apellido.trim().length === 0) {
            throw new DomainValidationError("El apellido del usuario es obligatorio");
        }

        this.id = id;
        this.nombre = nombre.trim();
        this.apellido = apellido.trim();
        this.email = email ? email.trim().toLowerCase() : null;
        this.password = password;
        this.rol = rol === "Organizador" ? "Organizador" : "Comprador";
        this.nombreProductora = nombreProductora ? nombreProductora.trim() : null;
        this.razonSocial = razonSocial ? razonSocial.trim() : null;
        this.favoritos = Array.isArray(favoritos) ? [...favoritos] : [];
    }

    get nombreCompleto() {
        if (this.nombreProductora && this.nombreProductora.trim().length > 0) {
            return this.nombreProductora.trim();
        }
        return `${this.nombre} ${this.apellido}`.trim();
    }

    agregarFavorito(evento) {
        if (!evento) {
            throw new DomainValidationError("Debe indicar un evento para agregar a favoritos");
        }
        const eventoId = typeof evento === "object" ? evento.id : evento;
        if (!eventoId) {
            throw new DomainValidationError("El evento a agregar no tiene un identificador válido");
        }

        const yaEsFavorito = this.favoritos.some(fav => {
            const id = typeof fav === "object" ? fav.id : fav;
            return id === eventoId;
        });

        if (!yaEsFavorito) {
            this.favoritos.push(evento);
        }
        return this.favoritos;
    }

    eliminarFavorito(eventoId) {
        if (!eventoId) {
            throw new DomainValidationError("Debe indicar el id del evento a eliminar");
        }
        const targetId = typeof eventoId === "object" ? eventoId.id : eventoId;
        const longitudInicial = this.favoritos.length;
        this.favoritos = this.favoritos.filter(fav => {
            const id = typeof fav === "object" ? fav.id : fav;
            return id !== targetId;
        });
        return this.favoritos.length < longitudInicial;
    }

    esFavorito(eventoId) {
        if (!eventoId) return false;
        const targetId = typeof eventoId === "object" ? eventoId.id : eventoId;
        return this.favoritos.some(fav => {
            const id = typeof fav === "object" ? fav.id : fav;
            return id === targetId;
        });
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            apellido: this.apellido,
            nombreCompleto: this.nombreCompleto,
            email: this.email,
            rol: this.rol,
            nombreProductora: this.nombreProductora,
            razonSocial: this.razonSocial,
            favoritos: this.favoritos.map(fav => (typeof fav === "object" && fav.id ? fav.id : fav))
        };
    }
}
