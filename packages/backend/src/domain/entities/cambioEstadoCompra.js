import crypto from "crypto";
import { EstadoCompra } from "../enums/estadoCompra.js";
import { DomainValidationError } from "../errors/DomainError.js";

export class CambioEstadoCompra {
    constructor({
        id = crypto.randomUUID(),
        compra,
        compraId = null,
        estado,
        quien,
        fechaHora = new Date(),
        motivo = ""
    } = {}) {
        if (!estado || !Object.values(EstadoCompra).includes(estado)) {
            throw new DomainValidationError(`El estado "${estado}" no es un EstadoCompra válido`);
        }
        if (!quien) {
            throw new DomainValidationError("Se debe indicar el usuario que efectúa el cambio de estado");
        }

        const fechaObj = fechaHora instanceof Date ? fechaHora : new Date(fechaHora);
        if (isNaN(fechaObj.getTime())) {
            throw new DomainValidationError("La fecha y hora del cambio de estado no es válida");
        }

        const cId = compraId || (typeof compra === "object" && compra ? compra.id : compra);

        this.id = id;
        this.compraId = cId || null;
        this.compra = typeof compra === "object" ? compra : null;
        this.estado = estado;
        this.quien = quien;
        this.fechaHora = fechaObj;
        this.motivo = typeof motivo === "string" ? motivo.trim() : "";
    }

    toJSON() {
        return {
            id: this.id,
            compraId: this.compraId,
            estado: this.estado,
            quienId: this.quien?.id || this.quien,
            quien: typeof this.quien?.toJSON === "function" ? this.quien.toJSON() : this.quien,
            fechaHora: this.fechaHora.toISOString(),
            motivo: this.motivo
        };
    }
}
