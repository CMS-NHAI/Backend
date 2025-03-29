export const keycloakCredential = {
    "realm": process.env.KEYCLOAK_REALM, 
    "serverUrl": process.env.KEYCLOAK_SERVER_URL,
    "ssl-required": process.env.SSL_REQUIRED,
    "clientId": process.env.KEYCLOAK_CLIENT_NAME,
    "client_name_id":process.env.KEYCLOAK_CLIENT_ID,
    "credentials": {
      "clientSecret":process.env.KEYCLOAK_CLIENT_SECRET,
    },
    "use-resource-role-mappings": process.env.KEYCLOAK_USE_RESOURCE_ROLE_MAPPINGS,
    "confidential-port": process.env.KEYCLOAK_CONFIDENTIAL_PORT,
    "public-client": process.env.KEYCLOAK_PUBLIC_CLIENT,
};

