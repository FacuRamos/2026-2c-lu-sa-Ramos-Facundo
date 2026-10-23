import { RequestValidationError } from '../controllers/errors/ControllerError.js';

export function validateRequest({ body, query, params } = {}) {
    return (req, res, next) => {
        try {
            if (body) {
                const parsedBody = body.safeParse(req.body);
                if (!parsedBody.success) {
                    const firstError = parsedBody.error.issues[0]?.message || 'Error de validación en el cuerpo';
                    throw new RequestValidationError(firstError, parsedBody.error.flatten());
                }
                req.body = parsedBody.data;
            }

            if (query) {
                const parsedQuery = query.safeParse(req.query);
                if (!parsedQuery.success) {
                    const firstError = parsedQuery.error.issues[0]?.message || 'Error de validación en los parámetros de consulta';
                    throw new RequestValidationError(firstError, parsedQuery.error.flatten());
                }
                Object.defineProperty(req, 'query', {
                    value: parsedQuery.data,
                    writable: true,
                    configurable: true,
                    enumerable: true
                });
            }

            if (params) {
                const parsedParams = params.safeParse(req.params);
                if (!parsedParams.success) {
                    const firstError = parsedParams.error.issues[0]?.message || 'Error de validación en los parámetros de ruta';
                    throw new RequestValidationError(firstError, parsedParams.error.flatten());
                }
                Object.defineProperty(req, 'params', {
                    value: parsedParams.data,
                    writable: true,
                    configurable: true,
                    enumerable: true
                });
            }

            next();
        } catch (err) {
            next(err);
        }
    };
}
