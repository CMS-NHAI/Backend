export const keycloakUrl = {
    "access_token": `${process.env.KEYCLOAK_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
    "url_to_create_role": `${process.env.KEYCLOAK_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/roles`,
    "url_to_get_role": `${process.env.KEYCLOAK_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/roles`,
    "url_to_update_role": `${process.env.KEYCLOAK_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/roles-by-id`,
    "url_to_get_role_via_rolename" : `${process.env.KEYCLOAK_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/roles`,
    "url_to_create_scope": `${process.env.KEYCLOAK_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/clients/${process.env.KEYCLOAK_CLIENT_ID}/authz/resource-server/scope`,
    "url_to_create_resource_and_scopes": `${process.env.KEYCLOAK_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/clients/${process.env.KEYCLOAK_CLIENT_ID}/authz/resource-server/resource`,
    "url_to_get_create_policy": `${process.env.KEYCLOAK_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/clients/${process.env.KEYCLOAK_CLIENT_ID}/authz/resource-server/policy/role`,
    "url_to_get_resource": `${process.env.KEYCLOAK_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/clients/${process.env.KEYCLOAK_CLIENT_ID}/authz/resource-server/resource`,
    "url_to_get_scope": `${process.env.KEYCLOAK_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/clients/${process.env.KEYCLOAK_CLIENT_ID}/authz/resource-server/scope`,
    "url_to_create_permission": `${process.env.KEYCLOAK_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/clients/${process.env.KEYCLOAK_CLIENT_ID}/authz/resource-server/permission/scope`,
}