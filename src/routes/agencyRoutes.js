import { Router } from "express";
import {
    createAgency,
    getAllAgencies,
    getAgencyById,
    getAgencyByInviteId,
    updateAgency,
    deleteAgency,
    loginAgency} from "../controllers/agency/agencyController.js";
import checkToken  from '../middlewares/checkToken.js';
import { createBulkAgency } from "../controllers/bulkRegistrationController.js";
import multer from "multer";
const agencyRoutes = Router();
const upload = multer({ dest: "uploads/" });

agencyRoutes.post("/",checkToken, createAgency);
agencyRoutes.get("/",checkToken, getAllAgencies);
agencyRoutes.get("/:id",checkToken, getAgencyById);
agencyRoutes.get("/invite/:id", getAgencyByInviteId);
agencyRoutes.put("/:id",checkToken, updateAgency);
agencyRoutes.delete("/:id",checkToken, deleteAgency);
agencyRoutes.post("/login", loginAgency)

//###### Agency Bulk Route #####//
agencyRoutes.post("/bulk-register-csv", upload.single("file"), createBulkAgency);
agencyRoutes.get("/download-log", (req, res) => {
                        const logFilePath = "invalid_rows.log";
                        if (fs.existsSync(logFilePath)) {
                        res.download(logFilePath);
                        } else {
                        res.status(404).json({ error: "Log file not found" });
                        }
                    });

export default agencyRoutes;
