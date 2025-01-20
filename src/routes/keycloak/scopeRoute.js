import { Router } from 'express';

import { keycloakScopeList, keycloakaddScope } from '../../controllers/keycloak/scopeController.js'

const router = Router();

router.get('/list', keycloakScopeList);
router.post('/create', keycloakaddScope);

export default router;
