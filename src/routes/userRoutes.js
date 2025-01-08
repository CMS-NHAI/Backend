import { Router } from 'express';
import { verifyOtp, signup , getUserDetails , getSapDetails, authenticateEntity, getAllUsers} from "../controllers/userController.js"

const router = Router();

router.post('/verify-otp', verifyOtp);
router.post('/signup',signup );
router.post('/get-user-details', getUserDetails);
router.post('/getsap', getSapDetails);
router.post('/authenticateEntity', authenticateEntity);
router.post('/list', getAllUsers);

export default router;
