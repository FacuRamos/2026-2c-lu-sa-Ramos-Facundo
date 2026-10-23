import { RequestValidationError } from '../errors/ControllerError.js';

/**
 * Validador genérico para esquemas Zod en controladores.
 * Parsea los datos de entrada de forma segura y lanza un RequestValidationError (HTTP 400)
 * estructurado con los detalles del error si no cumple la validación.
 *
 * @param {import('zod').ZodSchema} schema - Esquema Zod a aplicar
 * @param {any} data - Datos a validar (req.body, req.query o req.params)
 * @param {string} [defaultMessage] - Mensaje predeterminado de error
 * @returns {any} Datos parseados y tipados
 */
export function validate(schema, data, defaultMessage = 'Error de validación en la solicitud') {
    const result = schema.safeParse(data);
    if (!result.success) {
        const firstError = result.error.issues[0]?.message || defaultMessage;
        throw new RequestValidationError(firstError, result.error.flatten());
    }
    return result.data;
}
