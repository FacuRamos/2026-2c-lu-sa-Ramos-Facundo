import { Router } from 'express';
import { notificacionController } from '../controllers/NotificacionController.js';

const router = Router();

router.get('/', notificacionController.listar);
router.get('/conteo', notificacionController.conteoNoLeidas);
router.post('/', notificacionController.crear);
router.patch('/marcar-todas', notificacionController.marcarTodas);
router.post('/marcar-todas', notificacionController.marcarTodas);
router.patch('/:id/leida', notificacionController.marcarLeida);

export default router;
