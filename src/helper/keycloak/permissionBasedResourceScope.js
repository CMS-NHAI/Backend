import axios from 'axios';
import keycloakConfig from '../../constants/keycloak.json' with {type: "json"}; 

const { realm, serverUrl, client_name_id } = keycloakConfig;

export const permissionBasedResourceScope = async (permissionId, permissionName, permissionOriginalName, token, skip, take) => {
   
    try {
       
        // Check if permissionId or token is missing
        if (!permissionId || !token) {
            console.error(`Missing permissionId or token: permissionId = ${permissionId}, token = ${token}`);
            return { error: 'permissionId or token is missing' };
        }

        // Proceed with the API calls if both are valid
        const getPermissionBasedResourecUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/permission/${permissionId}/resources`;

        const permissionBasedResourecList = await axios.get(getPermissionBasedResourecUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            params: {
                first: skip,
                max: take
              }
        });

        const getPermissionBasedScopeUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/permission/${permissionId}/scopes`;

        const permissionBasedScopecList = await axios.get(getPermissionBasedScopeUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            params: {
                first: skip,
                max: take
              }
        });
        // ==== merge resource and scope start =======
        const mergedResult = {
            "permissionDetail": permissionBasedResourecList.data.map(resource => ({
              "resources": {
                "id": resource._id,
                "name": resource.name
              },
              "scopes": permissionBasedScopecList.data.map(scope => ({
                "id": scope.id,
                "name": scope.name
              }))
            }))
          };
          
        // ==== merge resource and scope end =======

        return {
            permissionId,
            permissionOriginalName,
            permissionName,
            mergedResult,
        };
    } catch (error) {
        console.error(`Error fetching details for permission ID ${permissionId}:`, error);
        return {
            permissionId,
            error: error.response ? error.response.data : error.message,
        };
    }
};