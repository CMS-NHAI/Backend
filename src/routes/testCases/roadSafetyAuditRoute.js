import express from 'express'
const router = express.Router()
import { viewRoadSafetyAudit, recommendRoadSafetyAudit, approveRoadSafetyAudit, suggestRoadSafetyAudit } from '../../controllers/testCases/roadSafetyAuditController.js'
import { userRoleResourcePermissionBasedAccess } from '../../middlewares/testCases/permissionMiddleware.js'
import checkToken from '../../middlewares/checkToken.js';

router.get('/view', checkToken, userRoleResourcePermissionBasedAccess(['Admin','PD', 'RO', 'Dy Manager', 'Manager', 'DGM', 'Other Staff'], ['Road Safety Audit'], ['view']), viewRoadSafetyAudit)
router.post('/recommend', checkToken, userRoleResourcePermissionBasedAccess(['Admin', 'PD'], ['Road Safety Audit'], ['Recommend']), recommendRoadSafetyAudit)
router.post('/approve', checkToken, userRoleResourcePermissionBasedAccess(['Admin','RO'], ['Road Safety Audit'], ['Approve']), approveRoadSafetyAudit)
router.post('/suggest', checkToken, userRoleResourcePermissionBasedAccess(['Admin', 'Dy Manager', 'Manager', 'DGM', 'Other Staff'], ['Road Safety Audit'], ['Suggest']), suggestRoadSafetyAudit)

export default router
