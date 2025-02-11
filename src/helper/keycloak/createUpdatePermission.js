import axios from 'axios';
import keycloakConfig from '../../constants/keycloak.json' with { type: "json" };
const { realm, serverUrl, client_name_id } = keycloakConfig;

export async function createUpdatePermission(roleName, policiesIds, authorization, token) {
    const createdUpdatedPermission = [];
  
    let count = 0;  // Initialize count outside the loop
  
    try {
      for (let auth of authorization) {
  
        // Check if the permission already exists and find the next available number
        let permissionName = `${roleName} Permission${count + 1}`;
        let permissionExists = true;
        
        while (permissionExists) {
          const permissionUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/permission/scope`;
          const permissionsResponse = await axios.get(permissionUrl, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
  
          // Check if any permission with the current name exists
          const existingPermission = permissionsResponse.data.find(p => p.name === permissionName);
        
          if (!existingPermission) {
            permissionExists = false;  // Unique permission name found
    
          } else {
            count++;  // Increment to try next permission name
            permissionName = `${roleName} Permission${count + 1}`;  // Update permission name
          }
        }
  
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
  
        // ================= get scope data end ===========================
        const resourceId = resourceData._id || resourceData.id;
  
        const permissionPayload = {
          "name": permissionName,  // Permission name now unique
          "scopes": scopeIds,
          "type": "scope",
          "logic": "POSITIVE",
          "description": "A scope permission for a specific scope",
          "resources": [resourceId],
          "policies": [policiesIds]
        };
  
        try {
            const keycloakPermissionUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/permission/scope`;

            const response = await axios.post(keycloakPermissionUrl, permissionPayload, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
           
  
          const finalScope = scopeResponse.data.filter(item => scopes.includes(item.name));
  
          const permissionDetail = {
            resources: { id: resourceData.id, name: resourceData.name },
            scopes: finalScope
          }
          
  
          createdUpdatedPermission.push(permissionDetail);
          // Increment count after each iteration for the next permission
          count++;
        } catch (error) {
          console.error(`Error creating resource "${resource}":`, error.response ? error.response.data : error.message);
        }
      }
  
      return createdUpdatedPermission;
  
    } catch (error) {
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  }
  