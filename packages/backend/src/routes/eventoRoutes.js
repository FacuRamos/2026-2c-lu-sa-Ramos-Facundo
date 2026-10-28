import { Router } from 'express';
import { eventoController } from '../controllers/EventoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = Router();

router.post('/', authMiddleware, requireRole('Organizador'), eventoController.crear);
router.get('/', eventoController.buscar);
router.get('/organizador/:organizadorId/resenias', eventoController.obtenerReseniasOrganizador);
router.get('/organizador/:organizadorId/compras', authMiddleware, requireRole('Organizador'), eventoController.obtenerComprasOrganizador);
router.get('/organizador/:organizadorId/stats', authMiddleware, requireRole('Organizador'), eventoController.obtenerStatsOrganizador);
router.get('/organizador/:organizadorId/conversaciones', authMiddleware, requireRole('Organizador'), eventoController.obtenerConversacionesOrganizador);
router.get('/:id', eventoController.obtenerPorId);

export default router;
