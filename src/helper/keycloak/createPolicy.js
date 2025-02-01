import axios from 'axios';
import keycloakConfig from '../../constants/keycloak.json' with { type: "json" };

const { realm, serverUrl, client_name_id } = keycloakConfig;
// Helper function to create policy
export async function createPolicy(roleName, token) {

    const keycloakRoleUrl = `${serverUrl}/admin/realms/${realm}/roles/${roleName}`;
  
    try {
      const checkRoleResponse = await axios.get(keycloakRoleUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const policyName = `${roleName} Policy`;
      const policyPayload = {
        name: policyName,
        type: "role",
        roles: [{ id: checkRoleResponse.data.id }],
      };
  
      const keycloakPolicyUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/policy/role`;
  
      // Step 1: Check if the policy already exists
      const checkPolicyResponse = await axios.get(keycloakPolicyUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const existingPolicy = checkPolicyResponse.data.find(policy => policy.name === policyName.trim());
      if (existingPolicy) {
        throw new Error(`Policy '${policyName}' already exists. Please choose a different policy name.`);
      }
  
      // Step 2: Create the policy if it doesn't exist
      const response = await axios.post(keycloakPolicyUrl, policyPayload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
  
      return response.data; // Return the created policy's data
    } catch (error) {
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  }