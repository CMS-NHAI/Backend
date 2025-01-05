// routes/otpRoutes.js
import { Router } from 'express';
import { sendOtpToUser } from "../controllers/otpController.js"

const router = Router();

router.post('/send-otp', sendOtpToUser);

export default router;