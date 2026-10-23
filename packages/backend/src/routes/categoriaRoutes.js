import { Router } from 'express';
import { categoriaController } from '../controllers/CategoriaController.js';

const router = Router();

router.post('/', categoriaController.crear);
router.get('/', categoriaController.listar);
router.get('/:id', categoriaController.obtenerPorId);

export default router;
