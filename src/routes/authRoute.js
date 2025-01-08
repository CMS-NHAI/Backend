// routes/otpRoutes.js
import { Router } from 'express';
import {digiLockerUserDetail} from '../controllers/authController.js'

const router = Router();

router.post('/digilocker-user-detail', digiLockerUserDetail);

export default router;