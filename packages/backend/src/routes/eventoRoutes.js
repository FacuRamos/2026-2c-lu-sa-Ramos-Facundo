import { Router } from 'express';
import { eventoController } from '../controllers/EventoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = Router();

router.post('/', authMiddleware, requireRole('Organizador'), eventoController.crear);
router.get('/', eventoController.buscar);
router.get('/organizador/:organizadorId/resenias', eventoController.obtenerReseniasOrganizador);
router.get('/:id', eventoController.obtenerPorId);

export default router;
