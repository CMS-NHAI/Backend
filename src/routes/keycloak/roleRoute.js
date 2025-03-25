import { Router } from 'express';
import { keycloakaddRoleResourceScopePolicyPermission, updateRoleAndScopes, keycloakRoleResourecScopeList, keycloakRoleList, keycloakaddRole, updateSingleResourceScopes , keycloakResourceDetail} from '../../controllers/keycloak/roleController.js'
import { userRoleResourcePermissionBasedAccess } from '../../middlewares/testCases/permissionMiddleware.js';
import checkToken from '../../middlewares/checkToken.js';
const router = Router();


router.post('/permission/create', checkToken, userRoleResourcePermissionBasedAccess(['Super Admin', 'HQ Admin'], ['Team Management/Access'], ['create roles']), keycloakaddRoleResourceScopePolicyPermission);
router.put('/scope/update', updateRoleAndScopes);
router.get('/resource/scope', keycloakRoleResourecScopeList);
//===============================================
router.post('/resource-scope/update', updateSingleResourceScopes);
router.post('/resource/detail', keycloakResourceDetail)
router.post('/create', keycloakaddRole);
router.get('/list', keycloakRoleList);

export default router;