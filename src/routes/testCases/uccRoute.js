import express from 'express'
const router = express.Router()
import { userRoleResourcePermissionBasedAccess } from '../../middlewares/testCases/permissionMiddleware.js'
import { uccList, transferPiu, uccLog, createUcc, updateUcc, deleteUcc, getAllUccList} from '../../controllers/testCases/uccController.js'
import checkToken from '../../middlewares/checkToken.js';

router.get('/list', checkToken, userRoleResourcePermissionBasedAccess(['Manager', 'PD', 'RO'], ['UCC'], ['View']), uccList)
router.get('/log', checkToken, userRoleResourcePermissionBasedAccess(['Manager', 'PD', 'RO'], ['UCC'], ['View Log']), uccLog)
router.post('/create', checkToken, userRoleResourcePermissionBasedAccess(['Manager', 'PD', 'RO'], ['UCC'], ['Create']), createUcc)
router.patch('/update', checkToken, userRoleResourcePermissionBasedAccess(['Manager', 'PD', 'RO'], ['UCC'], ['Update']), updateUcc)
router.delete('/delete', checkToken, userRoleResourcePermissionBasedAccess(['Manager', 'PD', 'RO'], ['UCC'], ['Delete']), deleteUcc)
router.patch('/transfer', checkToken, transferPiu)
router.get('/lists', getAllUccList)
// router.patch('/transfer', checkToken, userRoleResourcePermissionBasedAccess(['Admin'], ['UCC'], ['PIU Transfer']), transferPiu)

export default router

