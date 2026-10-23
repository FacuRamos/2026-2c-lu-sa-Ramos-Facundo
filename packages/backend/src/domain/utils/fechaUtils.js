export function aObjetoFecha(fecha) {
    if (!fecha) return null;
    const d = fecha instanceof Date ? fecha : new Date(fecha);
    return isNaN(d.getTime()) ? null : d;
}

export function calcularDiasFaltantes(fechaEvento, fechaReferencia = new Date()) {
    const fEvento = aObjetoFecha(fechaEvento);
    const fRef = aObjetoFecha(fechaReferencia);
    if (!fEvento || !fRef) return null;

    const diffMs = fEvento.getTime() - fRef.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function esFechaPasada(fecha, fechaReferencia = new Date()) {
    const f = aObjetoFecha(fecha);
    const fRef = aObjetoFecha(fechaReferencia);
    if (!f || !fRef) return false;
    return f.getTime() <= fRef.getTime();
}
