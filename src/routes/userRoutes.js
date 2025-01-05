import { Router } from 'express';
import { verifyOtp, signup } from "../controllers/userController.js"

const router = Router();

router.post('/verify-otp', verifyOtp);
router.post('/signup',signup );

export default router;
