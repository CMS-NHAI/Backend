import keycloakConfig from '../../constants/keycloak.json' with {type: "json"};
const { realm, serverUrl } = keycloakConfig;
import { keycloakAccessToken } from './keycloakAccessToken';
import axios from 'axios';

export const keycloakUpdateUserRole = async (roleData) => {

    const token = await keycloakAccessToken();

    if (!token) {
        return res.status(400).json({ msg: "Token is missing or invalid" });
    }

    const { userId, roleName } = roleData;

    if (!userId || !roleName || roleName.length === 0) {
        return res
            .status(400)
            .json({ message: "UserId and roleName are required" });
    }

    try {
        // Get the roles by name
        const rolesResponse = await axios.get(
            `${serverUrl}/admin/realms/${realm}/roles`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const roles = rolesResponse.data;

        const rolesToAssign = roleName.map((roleObj) => {
            const role = roles.find((r) => r.name === roleObj.name);
            if (!role) {
                throw new Error(`Role ${roleObj.name} not found`);
            }
            return {
                id: role.id,
                name: role.name,
            };
        });

        // Assign the roles to the user
        await axios.post(
            `${serverUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`,
            rolesToAssign,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // unassign role
        const userRoleList = await axios.get(
            `${serverUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const roleNames = roleName.map(role => role.name);

        const filteredRoles = userRoleList.data.filter(role => !roleNames.includes(role.name));

        const result = filteredRoles.map(role => (role.name));

        // Unassign the roles from the user
        const rolesList = [];
        try {

            for (let roleName of result) {
                const roleUrl = `${serverUrl}/admin/realms/${realm}/roles/${roleName}`;
                const roleResponse = await axios.get(roleUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (roleResponse.data) {
                    rolesList.push(roleResponse.data);
                }
            }

            if (rolesList.length !== result.length) {
                return res.status(404).json({
                    success: false,
                    message: "One or more roles not found",
                });
            }
        } catch (error) {
            return res.status(500).json({ success: false, msg: error.message });
        }

        const response = await axios.delete(`${serverUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            data: rolesList,
        });


        res
            .status(200)
            .json({ success: true, message: `User Role updated successfully.` });
    } catch (error) {
        res.status(500).json({ success: false, msg: error.message });
    }
};