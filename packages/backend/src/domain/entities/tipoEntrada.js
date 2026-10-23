import crypto from "crypto";
import { DomainValidationError, InsufficientCapacityError } from "../errors/DomainError.js";

export class TipoEntrada {
    constructor({
        id = crypto.randomUUID(),
        nombre,
        descripcion = "",
        precio,
        cupo,
        cupoDisponible = null
    } = {}) {
        if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
            throw new DomainValidationError("El nombre del tipo de entrada es obligatorio");
        }
        if (typeof precio !== "number" || isNaN(precio) || precio < 0) {
            throw new DomainValidationError("El precio debe ser un número mayor o igual a cero");
        }
        if (!Number.isInteger(cupo) || cupo < 0) {
            throw new DomainValidationError("El cupo total debe ser un número entero mayor o igual a cero");
        }

        const cupoDisp = cupoDisponible !== null && cupoDisponible !== undefined ? cupoDisponible : cupo;
        if (!Number.isInteger(cupoDisp) || cupoDisp < 0 || cupoDisp > cupo) {
            throw new DomainValidationError("El cupo disponible no puede ser negativo ni superar el cupo total");
        }

        this.id = id;
        this.nombre = nombre.trim();
        this.descripcion = typeof descripcion === "string" ? descripcion.trim() : "";
        this.precio = precio;
        this.cupo = cupo;
        this.cupoDisponible = cupoDisp;
    }

    hayCupoPara(cantidad) {
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            return false;
        }
        return this.cupoDisponible >= cantidad;
    }

    descontarCupo(cantidad) {
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            throw new DomainValidationError("La cantidad a descontar debe ser un entero positivo");
        }
        if (!this.hayCupoPara(cantidad)) {
            throw new InsufficientCapacityError(
                `Cupo insuficiente para el tipo de entrada "${this.nombre}". Solicitado: ${cantidad}, disponible: ${this.cupoDisponible}`
            );
        }
        this.cupoDisponible -= cantidad;
    }

    restituirCupo(cantidad) {
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            throw new DomainValidationError("La cantidad a restituir debe ser un entero positivo");
        }
        this.cupoDisponible = Math.min(this.cupo, this.cupoDisponible + cantidad);
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion,
            precio: this.precio,
            cupo: this.cupo,
            cupoDisponible: this.cupoDisponible
        };
    }
}
