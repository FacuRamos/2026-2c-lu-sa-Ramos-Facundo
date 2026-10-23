import crypto from "crypto";
import { EstadoCompra } from "../enums/estadoCompra.js";
import { DomainValidationError } from "../errors/DomainError.js";

export class Resenia {
    constructor({
        id = crypto.randomUUID(),
        comprador,
        evento,
        detalle,
        puntuacion,
        fecha = new Date()
    } = {}) {
        if (!comprador) {
            throw new DomainValidationError("El comprador que realiza la reseña es obligatorio");
        }
        if (!evento) {
            throw new DomainValidationError("El evento a reseñar es obligatorio");
        }
        if (!detalle || typeof detalle !== "string" || detalle.trim().length === 0) {
            throw new DomainValidationError("El comentario o detalle de la reseña no puede estar vacío");
        }
        if (typeof puntuacion !== "number" || isNaN(puntuacion) || puntuacion < 1 || puntuacion > 5) {
            throw new DomainValidationError("La puntuación debe ser un valor numérico entre 1 y 5");
        }

        const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
        if (isNaN(fechaObj.getTime())) {
            throw new DomainValidationError("La fecha de la reseña no es válida");
        }

        this.id = id;
        this.comprador = comprador;
        this.evento = evento;
        this.detalle = detalle.trim();
        this.puntuacion = puntuacion;
        this.fecha = fechaObj;
    }

    static validarCompraHabilitaResenia(compra, comprador, evento) {
        if (!compra) {
            throw new DomainValidationError("Se requiere una compra válida para verificar la reseña");
        }

        const compradorId = comprador?.id || comprador;
        const compraCompradorId = compra.compradorId ?? (compra.comprador?.id || compra.comprador);
        if (compradorId && compraCompradorId && compradorId !== compraCompradorId) {
            throw new DomainValidationError("La compra indicada no pertenece al comprador");
        }

        const eventoId = evento?.id || evento;
        const compraEventoId = compra.eventoId ?? (compra.evento?.id || compra.evento);
        if (eventoId && compraEventoId && eventoId !== compraEventoId) {
            throw new DomainValidationError("La compra indicada no corresponde al evento a reseñar");
        }

        if (compra.estado !== EstadoCompra.UTILIZADA) {
            throw new DomainValidationError(
                `Para poder calificar un evento, la compra debe estar en estado UTILIZADA (estado actual: ${compra.estado})`
            );
        }

        return true;
    }

    toJSON() {
        return {
            id: this.id,
            compradorId: this.comprador?.id || this.comprador,
            comprador: typeof this.comprador?.toJSON === "function" ? this.comprador.toJSON() : this.comprador,
            eventoId: this.evento?.id || this.evento,
            evento: typeof this.evento?.toJSON === "function" ? this.evento.toJSON() : this.evento,
            detalle: this.detalle,
            puntuacion: this.puntuacion,
            fecha: this.fecha.toISOString()
        };
    }
}
