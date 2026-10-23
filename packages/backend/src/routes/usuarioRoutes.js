import { Router } from 'express';
import { usuarioController } from '../controllers/UsuarioController.js';

const router = Router();

router.post('/', usuarioController.crear);
router.get('/', usuarioController.listar);
router.get('/:id', usuarioController.obtenerPorId);

router.post('/:id/favoritos', usuarioController.agregarFavorito);
router.delete('/:id/favoritos/:eventoId', usuarioController.eliminarFavorito);
router.get('/:id/favoritos', usuarioController.listarFavoritos);

export default router;
