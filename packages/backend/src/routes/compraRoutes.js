import { Router } from 'express';
import { compraController } from '../controllers/CompraController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = Router();

router.post('/', authMiddleware, requireRole('Comprador'), compraController.realizarCompra);
router.get('/comprador/:compradorId', compraController.obtenerPorComprador);
router.get('/usuario/:compradorId', compraController.obtenerPorComprador);
router.get('/evento/:eventoId', optionalAuthMiddleware, compraController.obtenerPorEvento);
router.get('/:id', compraController.obtenerPorId);
router.get('/:id/mensajes', async (req, res, next) => {
    try {
        const compra = await compraController.service.obtenerPorId(req.params.id);
        res.status(200).json(compra.mensajes || []);
    } catch (err) {
        next(err);
    }
});

router.post('/:id/cancelar', authMiddleware, requireRole('Comprador'), compraController.cancelar);
router.patch('/:id/cancelar', authMiddleware, requireRole('Comprador'), compraController.cancelar);
router.post('/:id/utilizar', authMiddleware, requireRole('Organizador'), compraController.marcarUtilizada);
router.patch('/:id/utilizar', authMiddleware, requireRole('Organizador'), compraController.marcarUtilizada);
router.post('/:id/mensajes', authMiddleware, compraController.enviarMensaje);

export default router;
