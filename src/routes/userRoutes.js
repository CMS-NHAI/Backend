import { Router } from 'express';
import { verifyOtp, createInvitation, verifyOtpLatest,  signup , getUserDetails , getSapDetails, authenticateEntity, getAllUsers, createUser , updateUserStatus, updateUser} from "../controllers/userController.js"
import checkToken  from '../middlewares/checkToken.js';
const router = Router();

//router.post('/verify-otp', verifyOtp);
router.post('/verify-otp', verifyOtpLatest);
router.post('/signup',signup );
router.post('/get-user-details', getUserDetails);
router.post('/getsap', getSapDetails);
router.post('/authenticateEntity', authenticateEntity);
router.post('/list', checkToken, getAllUsers);
router.post('/users',checkToken, createUser);
router.post('/users/status',checkToken, updateUserStatus );
router.put('/users',checkToken,  updateUser);
router.post('/users/invitationIndividual', checkToken, createInvitation);

export default router;
