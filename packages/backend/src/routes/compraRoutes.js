import { Router } from 'express';
import { compraController } from '../controllers/CompraController.js';

const router = Router();

router.post('/', compraController.realizarCompra);
router.get('/comprador/:compradorId', compraController.obtenerPorComprador);
router.get('/evento/:eventoId', compraController.obtenerPorEvento);
router.get('/:id', compraController.obtenerPorId);

router.post('/:id/cancelar', compraController.cancelar);
router.post('/:id/utilizar', compraController.marcarUtilizada);
router.post('/:id/mensajes', compraController.enviarMensaje);

export default router;
