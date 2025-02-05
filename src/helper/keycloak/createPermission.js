import axios from 'axios';
import keycloakConfig from '../../constants/keycloak.json' with { type: "json" };

const { realm, serverUrl, client_name_id } = keycloakConfig;

// Helper function to create permission
export async function createPermission(roleName, policiesIds, resourceIds, authorization, token) {
  const createdPermission = [];

  let count = 0;  // Initialize count outside the loop

  try {
    for (let auth of authorization) {

      // Ensure unique permissionName in each iteration by using count
      const permissionName = `${roleName} Permission${count + 1}`;

      const { resource, scopes } = auth;

      // ================= get resource data =================================
      const url = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/resource`;

      const resourceResponse = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Filter the resources by name
      const resourceData = resourceResponse.data.find(res => res.name === resource);

      // ================= get scope data start ============================
      const scopeurl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/scope`;

      const scopeResponse = await axios.get(scopeurl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Filter and get ids based on scope names in scopes from auth
      const scopeIds = scopeResponse.data
        .filter(scope => scopes.includes(scope.name))
        .map(scope => scope.id);

      // ================= get scope data end ============================
      const resourceId = resourceData._id || resourceData.id;

      const permissionPayload = {
        "name": permissionName,  // Permission name now unique
        "scopes": scopeIds,
        "type": "scope",
        "logic": "POSITIVE",
        "description": "A scope permission for a specific scope",
        "resources": [resourceId],
        "policies": policiesIds
      };

      try {
        const keycloakPermissionUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/permission/scope`;

        const response = await axios.post(keycloakPermissionUrl, permissionPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        //console.log("permission response", response.data)

        // console.log("resourceData ===>>>>", resourceData.name);
        // console.log("scopes =======>>>>", scopes)

        // console.log(" scopeResponse.data ====>>>",  scopeResponse.data)
        // console.log("scopes =====>>>>", scopes)

        const finalScope = scopeResponse.data.filter(item => scopes.includes(item.name));

        const permissionDetail = {
          // permissionId:response.data.id,
          // permissionName:response.data.name,
          // type: response.data.type,
          resources:{id:resourceData.id, name:resourceData.name},
          scopes:finalScope
         
        }

        createdPermission.push(permissionDetail);
        // Increment count after each iteration
        count++;
      } catch (error) {
        console.error(`Error creating resource "${resource}":`, error.response ? error.response.data : error.message);
      }
    }

    // console.log("createdPermission ====>>>>", createdPermission)

    return createdPermission;

  } catch (error) {
    throw new Error(error.response ? error.response.data.message : error.message);
  }
}
