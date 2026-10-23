import crypto from "crypto";
import { DomainValidationError } from "../errors/DomainError.js";

export class Categoria {
    constructor({
        id = crypto.randomUUID(),
        nombre,
        descripcion = ""
    } = {}) {
        if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
            throw new DomainValidationError("El nombre de la categoría es obligatorio");
        }

        this.id = id;
        this.nombre = nombre.trim();
        this.descripcion = typeof descripcion === "string" ? descripcion.trim() : "";
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion
        };
    }
}
