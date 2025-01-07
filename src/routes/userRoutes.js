import { Router } from 'express';
import { verifyOtp, signup , getUserDetails , getSapDetails} from "../controllers/userController.js"

const router = Router();

router.post('/verify-otp', verifyOtp);
router.post('/signup',signup );
router.post('/getUserDetails', getUserDetails);
router.post('/getsap', getSapDetails);

export default router;
