export function requireRole(...allowedRoles) {
    const roleAliases = {
        buyer: 'comprador',
        comprador: 'comprador',
        organizer: 'organizador',
        organizador: 'organizador'
    };

    const normalizedAllowed = allowedRoles.map(r => {
        const lower = String(r).toLowerCase();
        return roleAliases[lower] || lower;
    });

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'No autenticado',
                message: 'Se requiere iniciar sesión para acceder a este recurso'
            });
        }

        const userRole = String(req.user.role || req.user.rol || '').toLowerCase();
        const canonicalUserRole = roleAliases[userRole] || userRole;

        const isAllowed = normalizedAllowed.includes(canonicalUserRole);

        if (!isAllowed) {
            return res.status(403).json({
                error: 'Acceso denegado',
                message: 'Permisos insuficientes para realizar esta acción'
            });
        }

        next();
    };
}
