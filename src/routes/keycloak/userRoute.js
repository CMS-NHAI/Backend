import { Router } from 'express';

import { keycloakUserList, keycloakaddUser } from '../../controllers/keycloak/userController.js'

const router = Router();

router.post('/list', keycloakUserList);
router.post('/create', keycloakaddUser);

export default router;