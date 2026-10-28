import { Router } from 'express';
import { compraController } from '../controllers/CompraController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = Router();

router.post('/', authMiddleware, requireRole('Comprador'), compraController.realizarCompra);
router.get('/comprador/:compradorId', compraController.obtenerPorComprador);
router.get('/evento/:eventoId', compraController.obtenerPorEvento);
router.get('/:id', compraController.obtenerPorId);

router.post('/:id/cancelar', authMiddleware, requireRole('Comprador'), compraController.cancelar);
router.post('/:id/utilizar', authMiddleware, requireRole('Organizador'), compraController.marcarUtilizada);
router.post('/:id/mensajes', authMiddleware, compraController.enviarMensaje);

export default router;
