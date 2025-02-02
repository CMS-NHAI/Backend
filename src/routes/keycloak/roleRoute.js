import { Router } from 'express';

import { keycloakaddRoleResourceScopePolicyPermission, updateResourceScopes, keycloakRoleResourecScopeList, keycloakRoleList, keycloakaddRole, updateSingleResourceScopes , keycloakResourceDetail} from '../../controllers/keycloak/roleController.js'

const router = Router();


router.post('/permission/create', keycloakaddRoleResourceScopePolicyPermission);
router.put('/scope/update', updateResourceScopes);
router.get('/resource/scope', keycloakRoleResourecScopeList);
//===============================================
router.post('/resource-scope/update', updateSingleResourceScopes);
router.post('/resource/detail', keycloakResourceDetail)
router.post('/create', keycloakaddRole);
router.get('/list', keycloakRoleList);

export default router;