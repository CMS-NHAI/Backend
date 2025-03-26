import { Router } from 'express';

import { keycloakResourceList, keycloakaddResource, keycloakGetResourceScope } from '../../controllers/keycloak/resourceController.js'

const router = Router();

router.get('/list', keycloakResourceList);
router.post('/create', keycloakaddResource);
router.get('/scope/list', keycloakGetResourceScope)

export default router;
