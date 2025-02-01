import keycloakConfig from '../../constants/keycloak.json' with { type: "json" };

const { realm, serverUrl, client_name_id } = keycloakConfig;

// Helper function to validate role and authorization data
export function validateRoleAndAuthorization(role, authorization) {

    if (!role || typeof role !== 'string' || role.trim() === '') {
      throw new Error("Role name is required and should be a non-empty string.");
    }
    
    if (!authorization || !Array.isArray(authorization) || authorization.length === 0) {
      throw new Error("Authorization data is required and should be a non-empty array.");
    }
  
    authorization.forEach(auth => {
      if (!auth.resource || typeof auth.resource !== 'string' || auth.resource.trim() === '') {
        throw new Error(`Invalid resource data: ${auth.resource}. Resource name is required.`);
      }
  
      if (!Array.isArray(auth.scopes) || auth.scopes.length === 0) {
        throw new Error(`Invalid scopes for resource "${auth.resource}". Scopes must be a non-empty array.`);
      }
    });
  }