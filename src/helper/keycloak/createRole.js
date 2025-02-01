import axios from 'axios';
import keycloakConfig from '../../constants/keycloak.json' with { type: "json" };

const { realm, serverUrl, client_name_id } = keycloakConfig;

// Helper function to create a role
export async function createRole(roleName, token) {
    
    const rolePayload = { name: roleName.trim() };
    const keycloakRoleUrl = `${serverUrl}/admin/realms/${realm}/roles`;
  
    try {
      // Step 1: Check if the role already exists
      const checkRoleResponse = await axios.get(keycloakRoleUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const existingRole = checkRoleResponse.data.find(role => role.name === roleName.trim());
      if (existingRole) {
        throw new Error(`Role '${roleName}' already exists. Please choose a different role name.`);
      }
  
      // Step 2: Create the role if it doesn't exist
      const response = await axios.post(keycloakRoleUrl, rolePayload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
  
      return response.data; // Return the created role's data
    } catch (error) {
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  }