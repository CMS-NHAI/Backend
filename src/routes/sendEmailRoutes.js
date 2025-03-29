// routes/otpRoutes.js
import { Router } from 'express';
import { sendEmailViaZoho } from '../controllers/emailController.js';

const router = Router();

router.post('/send-email', sendEmailViaZoho);

export default router;