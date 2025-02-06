import { Router } from "express";
import {
    createAgency,
    getAllAgencies,
    getAgencyById,
    getAgencyByInviteId,
    updateAgency,
    deleteAgency} from "../controllers/agency/agencyController.js";
import checkToken  from '../middlewares/checkToken.js';
//import { verifyOtp, signup , getUserDetails , getSapDetails, authenticateEntity, getAllUsers, createUser , updateUserStatus, updateUser} from "../controllers/userController.js"

const agencyRoutes = Router();

agencyRoutes.post("/",checkToken, createAgency);
agencyRoutes.get("/",checkToken, getAllAgencies);
agencyRoutes.get("/:id",checkToken, getAgencyById);
agencyRoutes.get("/invite/:id", getAgencyByInviteId);
agencyRoutes.put("/:id",checkToken, updateAgency);
agencyRoutes.delete("/:id",checkToken, deleteAgency);

export default agencyRoutes;
