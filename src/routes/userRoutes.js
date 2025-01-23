import { Router } from 'express';
import { verifyOtp, verifyEmailOtpLatest, createInvitation, verifyOtpLatest,  signup , getUserDetails , getSapDetails, authenticateEntity, getAllUsers, createUser , updateUserStatus, updateUser , inviteUser, getUserById , updateUserById , getOfficeDetails, getContractDetails} from "../controllers/userController.js"
import checkToken  from '../middlewares/checkToken.js';
const router = Router();

//router.post('/verify-otp', verifyOtp);
router.post('/verify-otp', verifyOtpLatest);
router.post('/verify-emailotp', verifyEmailOtpLatest);
router.post('/verify-AgencyEmailOtp', verifyEmailOtpAgency);
router.post('/signup',signup );
router.post('/get-user-details', getUserDetails);
router.post('/getsap', getSapDetails);
router.post('/authenticateEntity', authenticateEntity);
router.post('/list', checkToken, getAllUsers);
router.post('/users',checkToken, createUser);
router.post('/users/status',checkToken, updateUserStatus );
router.put('/users',checkToken,  updateUser);
router.post('/users/invitationIndividual', checkToken, createInvitation);
router.post('/users/inviteUser', checkToken, inviteUser);
router.post('/users/getUserById', checkToken, getUserById);
router.put('/users/updateUserById', checkToken, updateUserById);
router.post('/org/getOffice', checkToken, getOfficeDetails);
router.post('/org/getContracts', checkToken, getContractDetails);

export default router;  
