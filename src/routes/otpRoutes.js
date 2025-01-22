// routes/otpRoutes.js
import { Router } from 'express';
import { sendOtpToUser , authenticateOtp, sendOtpToUserLatest, sendOtpToUserViaEmailLatest} from "../controllers/otpController.js"

const router = Router();

router.post('/send-otp', sendOtpToUserLatest);
router.post('/send-otp-viaEmail', sendOtpToUserViaEmailLatest);
router.post('/otp', authenticateOtp );

export default router;