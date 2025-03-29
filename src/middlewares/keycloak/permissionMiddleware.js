import { keycloakAccessToken } from "../../helper/keycloak/keycloakAccessToken.js";
import { getUserByEmailOrMobile } from "../../helper/keycloak/getUserByEmailOrMobile.js";
import { getKeycloakUserPermission } from "../../services/keycloak/getUserDetailsPermission.js";
import { userRoleResourcePermissionBasedAccessValdation } from "../../validations/validation.js";
import { RESPONSE_MESSAGES } from "../../constants/responseMessages.js";
import { STATUS_CODES } from "../../constants/statusCodesConstant.js";

/**
 * Description: Middleware use to filter the request on the basis of @role @resource and @permission
*/
export const userRoleResourcePermissionBasedAccess = (userRoles, userResource, userPermission) => {
    return async (req, res, next) => {
        try {

            const mobileNumber = req.user?.phone_number;
            const userEmail = req.user?.email;

            // Validation
            const validationError = userRoleResourcePermissionBasedAccessValdation(userRoles, userResource, userPermission, mobileNumber, userEmail)
            if (validationError) {
                return res.status(STATUS_CODES?.BAD_REQUEST).json({
                    success: RESPONSE_MESSAGES?.ERROR?.Fail,
                    status: STATUS_CODES?.BAD_REQUEST,
                    message: validationError,
                });
            }
            // Retrieve Keycloak token
            const token = await keycloakAccessToken();
            if (!token) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({ message: RESPONSE_MESSAGES?.ERROR?.INVALIDE_TOKEN });
            }

            // Fetch user by email or mobile
            const user = await getUserByEmailOrMobile(userEmail, mobileNumber, token);
            if (!user) {
                return res.status(STATUS_CODES.NOT_FOUND).json({ message: RESPONSE_MESSAGES.ERROR.USER_NOT_FOUND });
            }

            // Fetch user details for role, resource, and permission validation
            const userDetail = await getKeycloakUserPermission({ mobileNumber: mobileNumber });
            if (!userDetail) {
                return res.status(STATUS_CODES.NOT_FOUND).json({ message: RESPONSE_MESSAGES.ERROR.USER_DETAIL_NOT_FOUND });
            }

            // Validate roles
            const hasUserRoles = userRoles.some(role => userDetail?.userRole.includes(role));
            if (!hasUserRoles) {
                return res.status(STATUS_CODES.FORBIDDEN).json({ message: RESPONSE_MESSAGES.ERROR.ROLE_NOT_ALLOWED });
            }

            // Validate resources
            const matchedResource = userDetail?.userAuthorization?.filter(auth => userResource.includes(auth.resource));
            if (!matchedResource || matchedResource.length === 0) {
                return res.status(STATUS_CODES.FORBIDDEN).json({ message: RESPONSE_MESSAGES.ERROR.RESOURCE_NOT_FOUND });
            }

            // Validate permissions
            const hasPermission = matchedResource.some(auth =>
                auth.scope.some(scope => userPermission.includes(scope))
            );

            if (!hasPermission) {
                return res.status(STATUS_CODES.FORBIDDEN).json({ message: RESPONSE_MESSAGES.ERROR.INSUFFICIENT_PERMISSION });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message || RESPONSE_MESSAGES.ERROR.UNEXPECTED_ERROR });
        }
    };
};



