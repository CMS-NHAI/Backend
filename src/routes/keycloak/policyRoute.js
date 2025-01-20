import { Router } from 'express';

import { keycloakPolicyList, keycloakaddPolicy } from '../../controllers/keycloak/policyController.js'

const router = Router();

router.get('/list', keycloakPolicyList);
router.post('/create', keycloakaddPolicy);


export default router;