import express from 'express'
const router = express.Router()
import { viewTollMaster, approveTollMaster, recommendTollMaster, suggestTollMaster } from '../../controllers/testCases/tollMasterController.js'
import { userRoleResourcePermissionBasedAccess } from '../../middlewares/testCases/permissionMiddleware.js'
import checkToken from '../../middlewares/checkToken.js';

router.get('/view', checkToken, userRoleResourcePermissionBasedAccess(['Other Staff', 'Co-Div', 'CGM', 'GM'], ['Toll Master'], ['View']), viewTollMaster)
router.post('/approve', checkToken, userRoleResourcePermissionBasedAccess(['CGM'], ['Toll Master'], ['Approve']), approveTollMaster)
router.post('/recommend', checkToken, userRoleResourcePermissionBasedAccess(['GM'], ['Toll Master'], ['recommend']), recommendTollMaster)
router.post('/suggest', checkToken, userRoleResourcePermissionBasedAccess(['Other Staff'], ['Toll Master'], ['suggest']), suggestTollMaster)

export default router
