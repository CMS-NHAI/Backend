import express from 'express'
const router = express.Router()
import { viewRoadSafetyAudit, recommendRoadSafetyAudit, approveRoadSafetyAudit, suggestRoadSafetyAudit } from '../../controllers/testCases/roadSafetyAuditController.js'
import { userRoleResourcePermissionBasedAccess } from '../../middlewares/testCases/permissionMiddleware.js'
import checkToken from '../../middlewares/checkToken.js';

router.get('/view', checkToken, userRoleResourcePermissionBasedAccess(['PD', 'RO', 'Deputy Manager', 'Manager', 'DGM', 'Other Staff'], ['Road Safety Audit'], ['View']), viewRoadSafetyAudit)
router.post('/recommend', checkToken, userRoleResourcePermissionBasedAccess(['PD'], ['Road Safety Audit'], ['Recommend']), recommendRoadSafetyAudit)
router.post('/approve', checkToken, userRoleResourcePermissionBasedAccess(['RO'], ['Road Safety Audit'], ['Approve']), approveRoadSafetyAudit)
router.post('/suggest', checkToken, userRoleResourcePermissionBasedAccess(['Other'], ['Road Safety Audit'], ['Suggest']), suggestRoadSafetyAudit)

export default router
