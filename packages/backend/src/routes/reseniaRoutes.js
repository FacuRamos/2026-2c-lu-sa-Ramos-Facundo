import { Router } from 'express';
import { reseniaController } from '../controllers/ReseniaController.js';

const router = Router();

router.post('/', reseniaController.crear);
router.get('/evento/:eventoId', reseniaController.obtenerPorEvento);
router.get('/organizador/:organizadorId', reseniaController.obtenerPorOrganizador);
router.get('/:id', reseniaController.obtenerPorId);

export default router;
