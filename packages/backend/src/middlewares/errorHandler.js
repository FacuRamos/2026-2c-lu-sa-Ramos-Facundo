import {
    DomainError,
    DomainValidationError,
    InvalidStateTransitionError,
    InsufficientCapacityError,
    UnauthorizedActionError
} from '../domain/errors/DomainError.js';
import {
    RepositoryError,
    EntityNotFoundError,
    DuplicateEntityError
} from '../repositories/errors/RepositoryError.js';
import {
    ServiceError,
    NotFoundError,
    ConflictError,
    BusinessRuleError,
    UnauthorizedError
} from '../services/errors/ServiceError.js';
import {
    ControllerError,
    RequestValidationError
} from '../controllers/errors/ControllerError.js';

const HTTP_STATUS_BY_ERROR = [
    [RequestValidationError, 400],
    [DomainValidationError, 400],
    [InsufficientCapacityError, 400],
    [BusinessRuleError, 400],
    [UnauthorizedActionError, 403],
    [UnauthorizedError, 403],
    [EntityNotFoundError, 404],
    [NotFoundError, 404],
    [InvalidStateTransitionError, 409],
    [ConflictError, 409],
    [DuplicateEntityError, 409],
    [DomainError, 400],
    [ServiceError, 400],
    [ControllerError, 400],
    [RepositoryError, 500]
];

export function resolveHttpStatus(error) {
    if (error && typeof error.status === 'number') {
        return error.status;
    }
    const match = HTTP_STATUS_BY_ERROR.find(([ErrorType]) => error instanceof ErrorType);
    return match ? match[1] : 500;
}

export function errorHandler(err, req, res, next) {
    const status = resolveHttpStatus(err);

    if (status >= 500) {
        console.error('Unhandled internal server error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }

    const message = err.type === 'entity.parse.failed'
        ? 'El cuerpo de la petición debe ser un objeto JSON válido'
        : (err.message || 'Error en la solicitud');

    const body = { error: message };
    if (err.details) {
        body.details = err.details;
    }
    return res.status(status).json(body);
}
