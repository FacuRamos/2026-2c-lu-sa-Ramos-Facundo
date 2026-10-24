import { Router } from 'express';
import { authController } from '../controllers/AuthController.js';

const router = Router();

router.post('/register/buyer', authController.registrarComprador);
router.post('/register/organizer', authController.registrarOrganizador);
router.post('/login', authController.login);
router.post('/demo', authController.loginDemo);

export default router;
