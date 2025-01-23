import { Router } from 'express';

import { keycloakRoleList, keycloakaddRole, keycloakaddRoleResourceScopePolicyPermission, updateMultipleResourceScopes, updateSingleResourceScopes } from '../../controllers/keycloak/roleController.js'

const router = Router();

router.get('/list', keycloakRoleList);
router.post('/create', keycloakaddRole);
router.post('/permission', keycloakaddRoleResourceScopePolicyPermission);
router.post('/multiple-resource-scope/update', updateMultipleResourceScopes);
router.post('/single-resource-scope/update', updateSingleResourceScopes);

export default router;