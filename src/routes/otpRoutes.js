// routes/otpRoutes.js
import { Router } from 'express';
import { sendOtpToUser , authenticateOtp} from "../controllers/otpController.js"

const router = Router();

router.post('/send-otp', sendOtpToUser);
router.post('/otp', authenticateOtp );

export default router;