import express from 'express'
const router = express.Router()
import { generateKeycloakAccessToken } from '../../controllers/keycloak/keycloakAuthController.js';

router.get('/access-token', generateKeycloakAccessToken)


export default router;
