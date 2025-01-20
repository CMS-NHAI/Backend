import { Router } from 'express';

import { keycloakRoleList, keycloakaddRole } from '../../controllers/keycloak/roleController.js'

const router = Router();

router.get('/list', keycloakRoleList);
router.post('/create', keycloakaddRole);


export default router;