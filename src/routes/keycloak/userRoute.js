import { Router } from 'express';
import { keycloakAddUser, keycloakUserList, keycloakUserDetail, keycloakUserPermissionDetail,assignRoleToKeycloakUser, unassignRolesToKeycloakUser, updateUserAttributeOnKeycloak } from '../../controllers/keycloak/userController.js'
const router = Router();

router.post('/create', keycloakAddUser)
router.get('/list', keycloakUserList)
router.post('/detail', keycloakUserDetail)
router.post('/assign-role', assignRoleToKeycloakUser)
router.post('/unassign-role', unassignRolesToKeycloakUser)
router.post('/permission-detail', keycloakUserPermissionDetail)
router.post('/update-attribute', updateUserAttributeOnKeycloak)

export default router;