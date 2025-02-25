import { Router } from 'express';
import { verifyOtp, verifyEmailOtpLatest,getUserByInviteId, createInvitation, verifyEmailOtpAgency, verifyOtpLatest,  signup , getUserDetails , getSapDetails, authenticateEntity, getAllUsers, createUser , updateUserStatus, updateUser , inviteUser, getUserById , updateUserById , getOfficeDetails, getContractDetails, transferUser} from "../controllers/userController.js"
import checkToken  from '../middlewares/checkToken.js';
const router = Router();
import { userRoleResourcePermissionBasedAccess } from '../middlewares/testCases/permissionMiddleware.js'

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
router.get('/users/invite/:id', getUserByInviteId);
router.post('/users/getUserById', checkToken, getUserById);
router.put('/users/updateUserById', checkToken, updateUserById);
router.get('/org/getOffice', checkToken, getOfficeDetails);
router.get('/org/getContracts', checkToken, getContractDetails);
// Transfer User from PIU to PIU
router.patch('/transfer', checkToken, userRoleResourcePermissionBasedAccess(['Admin'], ['User'], ['User Transfer']), transferUser)

export default router;  
