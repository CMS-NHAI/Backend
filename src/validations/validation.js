import { RESPONSE_MESSAGES } from "../constants/responseMessages.js";
export const emailValdation = (email, subject, text) => {
    if (!email) {
        return RESPONSE_MESSAGES.ERROR.EMAIL_NOT_FOUND
    }
    if (!subject) {
        return RESPONSE_MESSAGES.ERROR.SUBJECT_NOT_FOUND
    }
    if (!text) {
        return RESPONSE_MESSAGES.ERROR.EMAIL_TEXT_NOT_FOUND
    }
    return null;
};

export const userRoleResourcePermissionBasedAccessValdation = (userRoles, userResource, userPermission, mobileNumber, userEmail) => {

    if (!mobileNumber || !userEmail) {
        return RESPONSE_MESSAGES.ERROR.EMAIL_MOBILE_NOT_FOUND;
    }

    if (!Array.isArray(userRoles) || userRoles.length === 0) {
        return RESPONSE_MESSAGES.ERROR.INVALIDE_ROLE
    }
    if (!Array.isArray(userResource) || userResource.length === 0) {
        return RESPONSE_MESSAGES.ERROR.INVALIDE_RESOURCE
    }
    if (!Array.isArray(userPermission) || userPermission.length === 0) {
        return RESPONSE_MESSAGES.ERROR.INVALIDE_PERMISSION
    }
    return null;
};