import { DomainValidationError } from "../errors/DomainError.js";

export function calcularPuntajeOrganizador(organizadorId, resenias = []) {
    if (!organizadorId || !Array.isArray(resenias) || resenias.length === 0) {
        return 0;
    }

    const reseniasDelOrg = resenias.filter(r => {
        const org = r.evento?.organizador;
        const orgId = typeof org === "object" ? org?.id : org;
        return orgId === organizadorId;
    });

    if (reseniasDelOrg.length === 0) {
        return 0;
    }

    const suma = reseniasDelOrg.reduce((acc, r) => acc + (Number(r.puntuacion) || 0), 0);
    const promedio = suma / reseniasDelOrg.length;
    return Math.round(promedio * 100) / 100;
}

export function filtrarEventos(eventos = [], {
    busqueda = "",
    categoriaId = null,
    precioMin = null,
    precioMax = null,
    organizadorId = null
} = {}) {
    if (!Array.isArray(eventos)) return [];

    return eventos.filter(evento => {
        // Filtro por organizador
        if (organizadorId) {
            const evOrgId = typeof evento.organizador === "object" ? evento.organizador?.id : evento.organizador;
            if (evOrgId !== organizadorId) {
                return false;
            }
        }

        // Filtro por término textual
        if (busqueda && typeof busqueda === "string" && busqueda.trim().length > 0) {
            if (!evento.coincideConBusqueda(busqueda)) {
                return false;
            }
        }

        // Filtro por categoría
        if (categoriaId) {
            const evCatId = evento.categoria?.id || evento.categoria;
            if (evCatId !== categoriaId) {
                return false;
            }
        }

        // Filtro por rango de precio
        const tieneMin = typeof precioMin === "number" && !isNaN(precioMin);
        const tieneMax = typeof precioMax === "number" && !isNaN(precioMax);
        if (tieneMin || tieneMax) {
            if (!evento.tuPrecioEstaEntre(tieneMin ? precioMin : null, tieneMax ? precioMax : null)) {
                return false;
            }
        }

        return true;
    });
}

export function ordenarEventos(eventos = [], {
    criterio = "fecha",
    direccion = "asc",
    resenias = []
} = {}) {
    if (!Array.isArray(eventos)) return [];
    const copia = [...eventos];
    const ordenAsc = direccion.toLowerCase() === "asc";
    const factor = ordenAsc ? 1 : -1;

    switch (criterio) {
        case "precio":
            return copia.sort((a, b) => {
                const precioA = a.obtenerPrecioMinimo() ?? Number.POSITIVE_INFINITY;
                const precioB = b.obtenerPrecioMinimo() ?? Number.POSITIVE_INFINITY;
                return (precioA - precioB) * factor;
            });

        case "fecha":
            return copia.sort((a, b) => {
                const fechaA = a.fecha instanceof Date ? a.fecha.getTime() : new Date(a.fecha).getTime();
                const fechaB = b.fecha instanceof Date ? b.fecha.getTime() : new Date(b.fecha).getTime();
                return (fechaA - fechaB) * factor;
            });

        case "puntajeOrganizador":
            return copia.sort((a, b) => {
                const orgIdA = a.organizador?.id || a.organizador;
                const orgIdB = b.organizador?.id || b.organizador;
                const puntajeA = calcularPuntajeOrganizador(orgIdA, resenias);
                const puntajeB = calcularPuntajeOrganizador(orgIdB, resenias);
                return (puntajeA - puntajeB) * factor;
            });

        default:
            throw new DomainValidationError(`Criterio de ordenamiento no soportado: "${criterio}"`);
    }
}
