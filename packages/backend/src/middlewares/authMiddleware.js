import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../services/AuthService.js';

export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'No autenticado',
            message: 'Token de autenticación no provisto o formato inválido (debe ser Bearer <token>)'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado',
                message: 'El token de sesión ha expirado'
            });
        }

        return res.status(401).json({
            error: 'Token inválido',
            message: 'Token de autenticación inválido o alterado'
        });
    }
}

export function optionalAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        } catch {
            // Ignorar token inválido en rutas con autenticación opcional
        }
    }
    next();
}
