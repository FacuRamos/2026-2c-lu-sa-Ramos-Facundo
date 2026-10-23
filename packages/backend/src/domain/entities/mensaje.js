import crypto from "crypto";
import { DomainValidationError } from "../errors/DomainError.js";

export class Mensaje {
    constructor({
        id = crypto.randomUUID(),
        usuario,
        mensaje,
        enviado = new Date()
    } = {}) {
        if (!usuario) {
            throw new DomainValidationError("El usuario emisor del mensaje es obligatorio");
        }
        if (!mensaje || typeof mensaje !== "string" || mensaje.trim().length === 0) {
            throw new DomainValidationError("El contenido del mensaje no puede estar vacío");
        }

        const fechaEnviado = enviado instanceof Date ? enviado : new Date(enviado);
        if (isNaN(fechaEnviado.getTime())) {
            throw new DomainValidationError("La fecha de envío no es válida");
        }

        this.id = id;
        this.usuario = usuario;
        this.mensaje = mensaje.trim();
        this.enviado = fechaEnviado;
    }

    toJSON() {
        return {
            id: this.id,
            usuarioId: this.usuario?.id || this.usuario,
            usuario: typeof this.usuario?.toJSON === "function" ? this.usuario.toJSON() : this.usuario,
            mensaje: this.mensaje,
            enviado: this.enviado.toISOString()
        };
    }
}
