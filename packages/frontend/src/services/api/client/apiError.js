export class ApiError extends Error {
  constructor(message, { status = 500, data = null, originalError = null } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.data = data;
    this.originalError = originalError;
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Error de validación en los datos', { data = null, originalError = null } = {}) {
    super(message, { status: 400, data, originalError });
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'No autorizado / Sesión expirada', { data = null, originalError = null } = {}) {
    super(message, { status: 401, data, originalError });
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Acceso denegado', { data = null, originalError = null } = {}) {
    super(message, { status: 403, data, originalError });
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Recurso no encontrado', { data = null, originalError = null } = {}) {
    super(message, { status: 404, data, originalError });
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Conflicto en la operación', { data = null, originalError = null } = {}) {
    super(message, { status: 409, data, originalError });
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'No se pudo conectar con el servidor', { originalError = null } = {}) {
    super(message, { status: 0, data: null, originalError });
  }
}

/**
 * Mapea una respuesta HTTP o error de red a una clase de error estructurada.
 * Extrae mensajes específicos de esquemas Zod retornados por el backend Express.
 */
export function createApiErrorFromResponse(status, body = null, originalError = null) {
  let message = 'Error en el servidor';

  if (body) {
    if (typeof body === 'string') {
      message = body;
    } else if (Array.isArray(body.details) && body.details.length > 0) {
      message = body.details.map((d) => d.message || d).join(', ');
    } else if (body.details?.issues && Array.isArray(body.details.issues) && body.details.issues.length > 0) {
      message = body.details.issues.map((i) => i.message).join(', ');
    } else if (body.message && typeof body.message === 'string') {
      message = body.message;
    } else if (body.error && typeof body.error === 'string') {
      message = body.error;
    }
  }

  switch (status) {
    case 400:
      return new ValidationError(message, { data: body, originalError });
    case 401:
      return new UnauthorizedError(message, { data: body, originalError });
    case 403:
      return new ForbiddenError(message, { data: body, originalError });
    case 404:
      return new NotFoundError(message, { data: body, originalError });
    case 409:
      return new ConflictError(message, { data: body, originalError });
    default:
      return new ApiError(message, { status, data: body, originalError });
  }
}
