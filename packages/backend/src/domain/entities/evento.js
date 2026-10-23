import crypto from "crypto";
import { DomainValidationError } from "../errors/DomainError.js";
import { TipoEntrada } from "./tipoEntrada.js";

export class Evento {
    constructor({
        id = crypto.randomUUID(),
        nombre,
        descripcion,
        categoria,
        fecha,
        organizador,
        tiposEntrada = [],
        multimedia = []
    } = {}) {
        if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
            throw new DomainValidationError("El nombre del evento es obligatorio");
        }
        if (!descripcion || typeof descripcion !== "string" || descripcion.trim().length === 0) {
            throw new DomainValidationError("La descripción del evento es obligatoria");
        }
        if (!categoria) {
            throw new DomainValidationError("La categoría del evento es obligatoria");
        }
        if (!organizador) {
            throw new DomainValidationError("El organizador del evento es obligatorio");
        }
        if (!fecha) {
            throw new DomainValidationError("La fecha del evento es obligatoria");
        }

        const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
        if (isNaN(fechaObj.getTime())) {
            throw new DomainValidationError("La fecha del evento no es válida");
        }

        this.id = id;
        this.nombre = nombre.trim();
        this.descripcion = descripcion.trim();
        this.categoria = categoria;
        this.fecha = fechaObj;
        this.organizador = organizador;
        this.multimedia = Array.isArray(multimedia) ? [...multimedia] : [];
        this.tiposEntrada = [];

        if (Array.isArray(tiposEntrada)) {
            for (const tipo of tiposEntrada) {
                this.agregarTipoEntrada(tipo);
            }
        }
    }

    agregarTipoEntrada(tipoEntrada) {
        if (!tipoEntrada) {
            throw new DomainValidationError("Debe proporcionar un tipo de entrada válido");
        }
        const instancia = tipoEntrada instanceof TipoEntrada
            ? tipoEntrada
            : new TipoEntrada(tipoEntrada);

        const yaExiste = this.tiposEntrada.some(t => t.id === instancia.id || t.nombre.toLowerCase() === instancia.nombre.toLowerCase());
        if (yaExiste) {
            throw new DomainValidationError(`Ya existe un tipo de entrada con el nombre o id "${instancia.nombre}" en este evento`);
        }

        this.tiposEntrada.push(instancia);
        return instancia;
    }

    obtenerTipoEntrada(tipoEntradaId) {
        if (!tipoEntradaId) return null;
        return this.tiposEntrada.find(t => t.id === tipoEntradaId) || null;
    }

    descontarCupo(tipoEntradaId, cantidad) {
        const tipo = this.obtenerTipoEntrada(tipoEntradaId);
        if (!tipo) {
            throw new DomainValidationError(`Tipo de entrada con id "${tipoEntradaId}" no encontrado en este evento`);
        }
        return tipo.descontarCupo(cantidad);
    }

    restituirCupo(tipoEntradaId, cantidad) {
        const tipo = this.obtenerTipoEntrada(tipoEntradaId);
        if (!tipo) {
            throw new DomainValidationError(`Tipo de entrada con id "${tipoEntradaId}" no encontrado en este evento`);
        }
        return tipo.restituirCupo(cantidad);
    }

    tuPrecioEstaEntre(min, max) {
        if (this.tiposEntrada.length === 0) {
            return false;
        }

        const tieneMin = typeof min === "number" && !isNaN(min);
        const tieneMax = typeof max === "number" && !isNaN(max);

        if (tieneMin && tieneMax && min > max) {
            throw new DomainValidationError("El valor mínimo no puede ser mayor al valor máximo");
        }

        return this.tiposEntrada.some(tipo => {
            if (tieneMin && tieneMax) {
                return tipo.precio >= min && tipo.precio <= max;
            }
            if (tieneMin) {
                return tipo.precio >= min;
            }
            if (tieneMax) {
                return tipo.precio <= max;
            }
            return true;
        });
    }

    obtenerPrecioMinimo() {
        if (this.tiposEntrada.length === 0) return null;
        return Math.min(...this.tiposEntrada.map(t => t.precio));
    }

    obtenerPrecioMaximo() {
        if (this.tiposEntrada.length === 0) return null;
        return Math.max(...this.tiposEntrada.map(t => t.precio));
    }

    hayCupoDisponible() {
        return this.tiposEntrada.some(t => t.cupoDisponible > 0);
    }

    totalEntradasDisponibles() {
        return this.tiposEntrada.reduce((sum, t) => sum + t.cupoDisponible, 0);
    }

    totalCupo() {
        return this.tiposEntrada.reduce((sum, t) => sum + t.cupo, 0);
    }

    yaSeRealizo(fechaReferencia = new Date()) {
        const ref = fechaReferencia instanceof Date ? fechaReferencia : new Date(fechaReferencia);
        return this.fecha.getTime() <= ref.getTime();
    }

    diasFaltantes(fechaReferencia = new Date()) {
        const ref = fechaReferencia instanceof Date ? fechaReferencia : new Date(fechaReferencia);
        const diffMs = this.fecha.getTime() - ref.getTime();
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    coincideConBusqueda(termino) {
        if (!termino || typeof termino !== "string") return true;
        const normalized = termino.trim().toLowerCase();
        if (normalized.length === 0) return true;

        const nombreMatch = this.nombre.toLowerCase().includes(normalized);
        const descripcionMatch = this.descripcion.toLowerCase().includes(normalized);
        const categoriaMatch = this.categoria?.nombre
            ? this.categoria.nombre.toLowerCase().includes(normalized)
            : false;

        return nombreMatch || descripcionMatch || categoriaMatch;
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion,
            categoriaId: this.categoria?.id || this.categoria,
            categoria: typeof this.categoria?.toJSON === "function" ? this.categoria.toJSON() : this.categoria,
            fecha: this.fecha.toISOString(),
            organizadorId: this.organizador?.id || this.organizador,
            organizador: typeof this.organizador?.toJSON === "function" ? this.organizador.toJSON() : this.organizador,
            tiposEntrada: this.tiposEntrada.map(t => typeof t?.toJSON === "function" ? t.toJSON() : t),
            multimedia: this.multimedia
        };
    }
}
