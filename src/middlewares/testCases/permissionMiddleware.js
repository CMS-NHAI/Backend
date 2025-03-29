import axios from "axios"
import { keycloakAccessToken } from "../../helper/keycloak/keycloakAccessToken.js";
import keycloakConfig from '../../constants/keycloak.json' with {type: "json"};
import { getUserByEmailOrMobile } from "../../helper/keycloak/getUserByEmailOrMobile.js";
const { realm, serverUrl } = keycloakConfig;
import { getKeycloakUserPermission } from "../../services/keycloak/getUserDetailsPermission.js"


/**
 * Case 3 : User transfer: PIU to PIU
 * Description: UCC access on the basis of user division and designation
 * Senerio : PIU amritsar manager transfer to PIU Badaun
 * Checks: Check user with manager role and division
*/
export const userRoleAndPiuBasedUccAccess = (userRoles) => {

    return async (req, res, next) => {

        const token = await keycloakAccessToken();

        if (!token) {
            return res.status(400).json({ message: "Token is missing or invalid" });
        }

        const mobileNumber = req.user?.mobile_number;
        const userEmail = req.user?.email;

        if (!mobileNumber && !userEmail) {
            return res.status(400).json({ message: "Mobile number or email is required" });
        }

        const url = `${serverUrl}/admin/realms/${realm}/users`;

        try {

            // Fetch users from Keycloak and filter by mobile number or email
            const user = await getUserByEmailOrMobile(userEmail, mobileNumber, token);

            if (user) {

                // Fetch user roles from Keycloak
                const rolesResponse = await axios.get(
                    `${url}/${user.id}/role-mappings`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                // Extract roles from the response
                const userRolesData = {
                    realmRoles: rolesResponse.data.realmMappings || [],
                    clientRoles: rolesResponse.data.clientMappings || {},
                };

                // == Match user role with incoming role ==
                const hasUserRoles = userRoles.some(
                    (role) =>
                        userRolesData.realmRoles.some((r) => r.name === role) ||
                        Object.values(userRolesData.clientRoles).some((clientRole) =>
                            clientRole.mappings.some((r) => r.name === role)
                        )
                );

                if (!hasUserRoles) {
                    return res
                        .status(403)
                        .json({ message: "Forbidden: Insufficient roles or permissions" });
                }

                // Proceed to the next middleware/controller
                next();

            } else {
                res.status(404).json({ message: "No user found with the given mobile number." });
            }

        } catch (error) {
            return res
                .status(500)
                .json({ message: error.message || "An error occurred" });
        }
    };
};

/**
 * Case 2 : User Roles & Permissions
 * Description: Road Safety Audit access on the basis of user division and designation
 * Senerio : PIU amritsar manager transfer to PIU Badaun
 * Checks: Check user with manager role and division
*/
export const userRoleResourcePermissionBasedAccess = (userRoles, userResource, userPermission) => {
    return async (req, res, next) => {
        try {

            // Validate the incoming parameters
            if (!Array.isArray(userRoles) || userRoles.length === 0) {
                return res.status(400).json({ message: "Invalid roles. Please provide an array of roles." });
            }
            if (!Array.isArray(userResource) || userResource.length === 0) {
                return res.status(400).json({ message: "Invalid resources. Please provide an array of resources." });
            }
            if (!Array.isArray(userPermission) || userPermission.length === 0) {
                return res.status(400).json({ message: "Invalid permissions. Please provide an array of permissions." });
            }

            // Retrieve Keycloak token
            const token = await keycloakAccessToken();

            if (!token) {
                return res.status(400).json({ message: "Token is missing or invalid" });
            }

            const mobileNumber = req.user?.phone_number;
            const userEmail = req.user?.email;

            if (!mobileNumber && !userEmail) {
                return res.status(400).json({ message: "Mobile number or email is required" });
            }

            // Fetch user by email or mobile
            const user = await getUserByEmailOrMobile(userEmail, mobileNumber, token);

            if (!user) {
                return res.status(404).json({ message: "No user found with the given mobile number or email." });
            }

            // Fetch user details for role, resource, and permission validation
            const userDetail = await getKeycloakUserPermission({ mobileNumber: mobileNumber });

            if (!userDetail) {
                return res.status(404).json({ message: "User details not found in the system." });
            }

            // Validate roles
            const hasUserRoles = userRoles.some(role => userDetail?.userRole.includes(role));
            if (!hasUserRoles) {
                return res.status(403).json({ message: "Forbidden: Insufficient roles" });
            }

            // Validate resources
            const matchedResource = userDetail?.userAuthorization?.filter(auth => userResource.includes(auth.resource));
            
            if (!matchedResource || matchedResource.length === 0) {
                return res.status(403).json({ message: "Forbidden: No matching resources found" });
            }

            // Validate permissions
            const hasPermission = matchedResource.some(auth => 
                auth.scope.some(scope => userPermission.includes(scope))
            );
           
            if (!hasPermission) {
                return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message || "An unexpected error occurred." });
        }
    };
};



