import { Router } from 'express';
import { eventoController } from '../controllers/EventoController.js';

const router = Router();

router.post('/', eventoController.crear);
router.get('/', eventoController.buscar);
router.get('/organizador/:organizadorId/resenias', eventoController.obtenerReseniasOrganizador);
router.get('/:id', eventoController.obtenerPorId);

export default router;
