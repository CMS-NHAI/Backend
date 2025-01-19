import { Router } from 'express';
import { GetAgencyList, createAgency } from '../controllers/agency/agencyController.js';
//import { verifyOtp, signup , getUserDetails , getSapDetails, authenticateEntity, getAllUsers, createUser , updateUserStatus, updateUser} from "../controllers/userController.js"

const agencyrouter = Router();

agencyrouter.post('/create-agency', createAgency);
agencyrouter.post('/get-agency-list', GetAgencyList);


export default agencyrouter;
