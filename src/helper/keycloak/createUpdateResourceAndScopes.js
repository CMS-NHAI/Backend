
import axios from 'axios';
import keycloakConfig from '../../constants/keycloak.json' with { type: "json" };
import { getScopeList } from './getScopeList.js';

const { realm, serverUrl, client_name_id } = keycloakConfig;

// Helper function to create resource and scopes
export async function createUpdateResourceAndScopes(authorization, scopeList, scopeListId, token) {

    const createdResources = [];

    for (let auth of authorization) {
      const { resource, scopes } = auth;
  
      const resourceData = { name: resource, type: 'client', scopes: scopeList };
  
      try {
        const keycloakUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/resource`;
        const response = await axios.post(keycloakUrl, resourceData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        createdResources.push(response.data);
      } catch (error) {
        console.error(`Error creating resource "${resource}":`, error.response ? error.response.data : error.message);
      }
    }
  
    return createdResources;
  }