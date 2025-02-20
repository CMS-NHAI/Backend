
import axios from 'axios';
import keycloakConfig from '../../constants/keycloak.json' with { type: "json" };

const { realm, serverUrl, client_name_id } = keycloakConfig;

// Helper function to create resource and scopes
export async function createScope(authorization, token) {

    const allScopes = [...new Set(authorization.reduce((acc, item) => acc.concat(item.scopes), []))];

    const createdScopes = [];
    try {

        for (let i =0 ; i<allScopes.length; i++) {
      const keycloakUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/scope`;
      const response = await axios.post(keycloakUrl, allScopes[i], {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      createdScopes.push(response.data)
    }
    
    return createdScopes; // Return the created role's data
    } catch (error) {
        
      console.error(`Error creating scope:`, error.response ? error.response.data : error.message);
    }

  }