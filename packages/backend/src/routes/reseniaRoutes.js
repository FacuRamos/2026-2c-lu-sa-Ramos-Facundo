import { Router } from 'express';
import { reseniaController } from '../controllers/ReseniaController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = Router();

router.post('/', authMiddleware, requireRole('Comprador'), reseniaController.crear);
router.get('/evento/:eventoId', reseniaController.obtenerPorEvento);
router.get('/organizador/:organizadorId', reseniaController.obtenerPorOrganizador);
router.get('/:id', reseniaController.obtenerPorId);

export default router;
