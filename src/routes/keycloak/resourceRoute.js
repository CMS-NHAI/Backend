import { Router } from 'express';

import { keycloakResourceList, keycloakaddResource } from '../../controllers/keycloak/resourceController.js'

const router = Router();

router.get('/list', keycloakResourceList);
router.post('/create', keycloakaddResource);

export default router;
