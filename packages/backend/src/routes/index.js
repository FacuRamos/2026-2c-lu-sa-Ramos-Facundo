import { Router } from 'express';
import usuarioRoutes from './usuarioRoutes.js';
import categoriaRoutes from './categoriaRoutes.js';
import eventoRoutes from './eventoRoutes.js';
import compraRoutes from './compraRoutes.js';
import reseniaRoutes from './reseniaRoutes.js';
import authRoutes from './authRoutes.js';
import notificacionRoutes from './notificacionRoutes.js';
import { seedController } from '../controllers/SeedController.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/notificaciones', notificacionRoutes);
apiRouter.use('/usuarios', usuarioRoutes);
apiRouter.use('/categorias', categoriaRoutes);
apiRouter.use('/eventos', eventoRoutes);
apiRouter.use('/compras', compraRoutes);
apiRouter.use('/resenias', reseniaRoutes);

// Endpoint utilitario para reseedear datos desde Postman
apiRouter.post('/seed', seedController.seed);

export default apiRouter;
