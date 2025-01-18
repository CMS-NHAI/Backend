// routes/otpRoutes.js
import { Router } from 'express';
import { sendOtpToUser , authenticateOtp, sendOtpToUserLatest} from "../controllers/otpController.js"

const router = Router();

router.post('/send-otp', sendOtpToUserLatest);
router.post('/otp', authenticateOtp );

export default router;