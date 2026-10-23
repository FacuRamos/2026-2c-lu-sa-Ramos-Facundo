import crypto from "crypto";
import { EstadoCompra } from "../enums/estadoCompra.js";
import {
    DomainValidationError,
    InvalidStateTransitionError,
    UnauthorizedActionError
} from "../errors/DomainError.js";
import { Mensaje } from "./mensaje.js";
import { CambioEstadoCompra } from "./cambioEstadoCompra.js";

const TRANSICIONES_VALIDAS = {
    [EstadoCompra.PENDIENTE]: [EstadoCompra.CONFIRMADA, EstadoCompra.CANCELADA],
    [EstadoCompra.CONFIRMADA]: [EstadoCompra.UTILIZADA, EstadoCompra.CANCELADA, EstadoCompra.REEMBOLSADA],
    [EstadoCompra.CANCELADA]: [EstadoCompra.REEMBOLSADA],
    [EstadoCompra.UTILIZADA]: [],
    [EstadoCompra.REEMBOLSADA]: []
};

export class Compra {
    constructor({
        id = crypto.randomUUID(),
        comprador,
        evento,
        tipoEntrada,
        cantidad,
        total = null,
        estado = EstadoCompra.PENDIENTE,
        fechaCompra = new Date(),
        mensajes = [],
        historialEstados = []
    } = {}) {
        if (!comprador) {
            throw new DomainValidationError("El comprador es obligatorio");
        }
        if (!evento) {
            throw new DomainValidationError("El evento es obligatorio");
        }
        if (!tipoEntrada) {
            throw new DomainValidationError("El tipo de entrada es obligatorio");
        }
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            throw new DomainValidationError("La cantidad de entradas debe ser un entero positivo");
        }
        if (!Object.values(EstadoCompra).includes(estado)) {
            throw new DomainValidationError(`El estado "${estado}" no es un EstadoCompra válido`);
        }

        const fechaObj = fechaCompra instanceof Date ? fechaCompra : new Date(fechaCompra);
        if (isNaN(fechaObj.getTime())) {
            throw new DomainValidationError("La fecha de compra no es válida");
        }

        const precioUnitario = typeof tipoEntrada.precio === "number" ? tipoEntrada.precio : 0;
        const totalCalculado = total !== null && total !== undefined ? total : (precioUnitario * cantidad);
        if (typeof totalCalculado !== "number" || isNaN(totalCalculado) || totalCalculado < 0) {
            throw new DomainValidationError("El monto total de la compra no es válido");
        }

        this.id = id;
        this.comprador = comprador;
        this.evento = evento;
        this.tipoEntrada = tipoEntrada;
        this.cantidad = cantidad;
        this.total = totalCalculado;
        this.estado = estado;
        this.fechaCompra = fechaObj;
        this.mensajes = [];
        this.historialEstados = [];

        if (Array.isArray(mensajes)) {
            for (const m of mensajes) {
                const msg = m instanceof Mensaje ? m : new Mensaje(m);
                this.mensajes.push(msg);
            }
        }

        if (Array.isArray(historialEstados) && historialEstados.length > 0) {
            for (const h of historialEstados) {
                const cambio = h instanceof CambioEstadoCompra ? h : new CambioEstadoCompra(h);
                this.historialEstados.push(cambio);
            }
        } else {
            // Historial inicial
            this.historialEstados.push(
                new CambioEstadoCompra({
                    compraId: this.id,
                    estado: this.estado,
                    quien: this.comprador,
                    fechaHora: this.fechaCompra,
                    motivo: "Creación de la compra"
                })
            );
        }
    }

    get compradorId() {
        return typeof this.comprador === 'object' && this.comprador !== null
            ? this.comprador.id
            : this.comprador;
    }

    get eventoId() {
        return typeof this.evento === 'object' && this.evento !== null
            ? this.evento.id
            : this.evento;
    }

    get tipoEntradaId() {
        return typeof this.tipoEntrada === 'object' && this.tipoEntrada !== null
            ? this.tipoEntrada.id
            : this.tipoEntrada;
    }

    puedeSerReseniadaPor(comprador, evento) {
        const compId = typeof comprador === 'object' && comprador !== null ? comprador.id : comprador;
        const evId = typeof evento === 'object' && evento !== null ? evento.id : evento;
        return this.compradorId === compId && this.eventoId === evId && this.estado === EstadoCompra.UTILIZADA;
    }

    actualizarEstado(nuevoEstado, usuario = null, motivo = "") {
        if (!Object.values(EstadoCompra).includes(nuevoEstado)) {
            throw new DomainValidationError(`El estado "${nuevoEstado}" no es un EstadoCompra válido`);
        }
        if (this.estado === nuevoEstado) {
            throw new InvalidStateTransitionError(`La compra ya se encuentra en estado ${nuevoEstado}`);
        }

        const permitidos = TRANSICIONES_VALIDAS[this.estado] || [];
        if (!permitidos.includes(nuevoEstado)) {
            throw new InvalidStateTransitionError(
                `Transición de estado inválida: no se puede pasar de "${this.estado}" a "${nuevoEstado}"`
            );
        }

        const usuarioAccion = usuario || this.comprador;
        this.estado = nuevoEstado;
        const cambio = new CambioEstadoCompra({
            compraId: this.id,
            estado: nuevoEstado,
            quien: usuarioAccion,
            fechaHora: new Date(),
            motivo: motivo || `Cambio de estado a ${nuevoEstado}`
        });
        this.historialEstados.push(cambio);
        return cambio;
    }

    diasParaElEvento(fechaReferencia = new Date(), soloConfirmada = true) {
        if (soloConfirmada && this.estado !== EstadoCompra.CONFIRMADA) {
            return null;
        }
        return this.evento.diasFaltantes(fechaReferencia);
    }

    puedeCancelarse(fechaReferencia = new Date()) {
        if (this.estado === EstadoCompra.UTILIZADA) return false;
        if (this.estado === EstadoCompra.CANCELADA) return false;
        if (this.estado === EstadoCompra.REEMBOLSADA) return false;
        if (this.evento.yaSeRealizo(fechaReferencia)) return false;
        return true;
    }

    cancelar(usuario, fechaReferencia = new Date(), conReembolso = true, motivo = "Cancelación de compra") {
        if (this.estado === EstadoCompra.UTILIZADA) {
            throw new InvalidStateTransitionError("No se puede cancelar una compra cuya entrada ya ha sido utilizada");
        }
        if (this.estado === EstadoCompra.CANCELADA || this.estado === EstadoCompra.REEMBOLSADA) {
            throw new InvalidStateTransitionError("La compra ya se encuentra cancelada o reembolsada");
        }
        if (this.evento.yaSeRealizo(fechaReferencia)) {
            throw new InvalidStateTransitionError("No se puede cancelar una compra de un evento que ya se ha realizado");
        }

        if (this.evento && typeof this.evento.restituirCupo === "function") {
            this.evento.restituirCupo(this.tipoEntradaId, this.cantidad);
        } else if (this.tipoEntrada && typeof this.tipoEntrada.restituirCupo === "function") {
            this.tipoEntrada.restituirCupo(this.cantidad);
        }

        const esPendiente = this.estado === EstadoCompra.PENDIENTE;
        const nuevoEstado = esPendiente ? EstadoCompra.CANCELADA : (conReembolso ? EstadoCompra.REEMBOLSADA : EstadoCompra.CANCELADA);
        const motivoFinal = motivo || (esPendiente ? "Cancelación de compra pendiente" : (conReembolso ? "Cancelación con reembolso" : "Cancelación de compra"));
        return this.actualizarEstado(nuevoEstado, usuario || this.comprador, motivoFinal);
    }

    marcarUtilizada(usuario, fechaReferencia = new Date(), motivo = "Entrada utilizada en el evento") {
        if (this.estado !== EstadoCompra.CONFIRMADA) {
            throw new InvalidStateTransitionError(
                `Solo se puede marcar como utilizada una compra en estado CONFIRMADA (estado actual: ${this.estado})`
            );
        }
        return this.actualizarEstado(EstadoCompra.UTILIZADA, usuario || this.evento.organizador, motivo);
    }

    agregarMensaje(usuario, texto) {
        if (!usuario) {
            throw new DomainValidationError("Se debe indicar el usuario que envía el mensaje");
        }
        const usuarioId = typeof usuario === "object" ? usuario.id : usuario;
        const compradorId = typeof this.comprador === "object" ? this.comprador.id : this.comprador;
        const organizadorId = typeof this.evento?.organizador === "object"
            ? this.evento.organizador.id
            : this.evento?.organizador;

        const esComprador = usuarioId === compradorId;
        const esOrganizador = usuarioId === organizadorId;

        if (!esComprador && !esOrganizador) {
            throw new UnauthorizedActionError(
                "Solo el comprador o el organizador del evento pueden enviar mensajes en el chat de esta compra"
            );
        }

        const nuevoMensaje = new Mensaje({
            usuario,
            mensaje: texto,
            enviado: new Date()
        });

        this.mensajes.push(nuevoMensaje);
        return nuevoMensaje;
    }

    toJSON() {
        return {
            id: this.id,
            compradorId: this.comprador?.id || this.comprador,
            comprador: typeof this.comprador?.toJSON === "function" ? this.comprador.toJSON() : this.comprador,
            eventoId: this.evento?.id || this.evento,
            evento: typeof this.evento?.toJSON === "function" ? this.evento.toJSON() : this.evento,
            tipoEntradaId: this.tipoEntrada?.id || this.tipoEntrada,
            tipoEntrada: typeof this.tipoEntrada?.toJSON === "function" ? this.tipoEntrada.toJSON() : this.tipoEntrada,
            cantidad: this.cantidad,
            total: this.total,
            estado: this.estado,
            fechaCompra: this.fechaCompra.toISOString(),
            mensajes: this.mensajes.map(m => typeof m?.toJSON === "function" ? m.toJSON() : m),
            historialEstados: this.historialEstados.map(h => typeof h?.toJSON === "function" ? h.toJSON() : h)
        };
    }
}
