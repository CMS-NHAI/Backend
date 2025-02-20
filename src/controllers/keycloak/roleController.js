import { keycloakAccessToken } from "../../helper/keycloak/keycloakAccessToken.js";
import { createResourceAndScopes } from "../../helper/keycloak/createResourceAndScopes.js";
import { createPermission } from "../../helper/keycloak/createPermission.js";
import { createPolicy } from "../../helper/keycloak/createPolicy.js";
import { createRole } from "../../helper/keycloak/createRole.js";
import { createScope } from "../../helper/keycloak/createScope.js";
import { permissionBasedResourceScope } from "../../helper/keycloak/permissionBasedResourceScope.js";
import { removeLastWord } from "../../helper/keycloak/removeLastWord.js";
import { validateRoleAndAuthorization } from "../../helper/keycloak/validateRoleAndAuthorization.js";
import axios from 'axios';
import keycloakConfig from '../../constants/keycloak.json' with { type: "json" };
import { createUpdateResourceAndScopes } from "../../helper/keycloak/createUpdateResourceAndScopes.js";
import { createUpdatePermission } from "../../helper/keycloak/createUpdatePermission.js";
import { createUpdateScope } from "../../helper/keycloak/createUpdateScope.js";


const { realm, serverUrl, client_name_id } = keycloakConfig;

/**
 * Method @POST
 * Description : Create role along with resources, scopes, policy, permission
*/
export const keycloakaddRoleResourceScopePolicyPermission = async (req, res) => {
  const token = await keycloakAccessToken();

  if (!token) {
    return res.status(400).json({ message: "Token is missing or invalid" });
  }

  const { role, authorization } = req.body;

  if (!role || role.trim() === "") {
    return res.status(400).json({ success: false, message: "Role is required and cannot be empty" });
  }

  try {

    // Step 1: Validate the role and authorization data
    validateRoleAndAuthorization(role, authorization);

    // Step 2: Create the role
    const roleDetail = await createRole(role, token);

    // step 3: Create the scope
    const scopeList = await createScope(authorization, token)
    const scopeIds = scopeList.map(scope => scope.id);
    const scopeNames = scopeList.map(scope => scope.name);

    // Step 4: Create resources and scopes
    const resourceDetails = await createResourceAndScopes(authorization, scopeNames, scopeIds, token);
    const allResourceIds = resourceDetails.map(resource => resource._id);

    // Step 5: Create the policy
    const policyDetail = await createPolicy(role, token);
    const allPolicyIds = [policyDetail.id];

    // Step 6: Create the permission
    const permissionDetail = await createPermission(role, allPolicyIds, allResourceIds, authorization, token);

    const data = {
      role: role,
      authorization: permissionDetail
    }

    res.status(201).json({
      success: true,
      message: "Role & Permission added successfully.",
      data: data
    });
  } catch (error) {
    // Handle validation or API errors
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Method @PUT
 * Description : update role, scopes, policy, permission
*/
export async function updateRoleAndScopes(req, res) {

  const token = await keycloakAccessToken();

  if (!token) {
    return res.status(400).json({ message: "Token is missing or invalid" });
  }

  const { roleId, roleName, rolePermission } = req.body

  try {

    // === update role start ===
    const baseRoleUrl = `${serverUrl}/admin/realms/nhai-realm/roles-by-id`;
    const data = {
      "name": roleName
    }
    const updateRole = await axios.put(
      `${baseRoleUrl}/${roleId}`,
      data,
      {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }
    );

    // === update role end =====

    // === update Policy start =
    // **** get role start ****
    const keycloakRoleUrl = `${serverUrl}/admin/realms/${realm}/roles/${roleName}`;
    const checkRoleResponse = await axios.get(keycloakRoleUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // **** get role end ****
    // **** get policy start ***
    const keycloakPolicyListUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/policy/role`;
    const checkPolicyResponse = await axios.get(keycloakPolicyListUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // **** get policy end *****
    // **** get filtered policy on the basis of role id start ****
    const roleBasedPoliciesList = checkPolicyResponse.data.filter(policy =>
      policy.roles.some(role => role.id === checkRoleResponse.data.id)
    );

    // **** get filtered policy on the basis of role id end ******
    // **** update policy name on the basis of policy id start
    const policyUpdatePromises = roleBasedPoliciesList.map(async (policy) => {

      try {
        const policyName = `${roleName} Policy`;
        const policyData = {
          name: policyName,
          type: "role",
          roles: [{ id: checkRoleResponse.data.id }],
        };

        // Log the URL to confirm correctness

        // Make the PUT request to update the policy
        const response = await axios.put(
          `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/policy/role/${policy.id}`,
          policyData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      } catch (error) {
        throw new Error(`Error updating policy ${policy.id}`);
      }
    });

    // Await all policy update promises
    const policyUpdateResults = await Promise.all(policyUpdatePromises);
    // **** update policy name on the basis of policy id end

    let count = 0;
    for (const permission of rolePermission) {
      const permissionName = `${roleName} Permission${count + 1}`;
      const permissionBaseUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/permission/scope`;
      const data = {
        name: permissionName,
        scopes: permission.scopes,
        type: permission.type,
        logic: permission.logic
      };

      await axios.put(
        `${permissionBaseUrl}/${permission.id}`,
        data,
        {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }
      );

      count++;
    }

    // ========= create new resource & scope start ======================
    const authorization = req.body?.authorization
    if (authorization) {

      // step 1: Create the scope
      const scopeList = await createUpdateScope(authorization, token)
      const scopeIds = scopeList.map(scope => scope.id);
      const scopeNames = scopeList.map(scope => scope.name);

      // Step 2: Create resources and scopes
      const resourceDetails = await createUpdateResourceAndScopes(authorization, scopeNames, scopeIds, token);
      const allResourceIds = resourceDetails.map(resource => resource._id);

      // Step 3: Create permission if new resources and scopes are added

      try {
        await Promise.all(
          roleBasedPoliciesList.map((policy) =>
            createUpdatePermission(roleName, policy.id, authorization, token)
              .catch((error) => {
                console.error(`Error updating policy ${policy.id}:`, error);
              })
          )
        );
      } catch (error) {
        console.error('Error updating one or more policies:', error);
      }

    }

    // ========= create new resource & scope end ======================

    res.status(200).json({ success: true, message: "Permission updated successfully!" });

  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred while updating the resource.' });
  }
}

/**
 * Method @POST
 * Description : List of role, scopes, policy, permission
*/
export const keycloakRoleResourecScopeList = async (req, res) => {

  const token = await keycloakAccessToken();

  if (!token) {
    return res.status(400).json({ message: "Token is missing or invalid" });
  }

  try {

    // === get role ========
    const keycloakRoleUrl = `${serverUrl}/admin/realms/${realm}/roles`;
    const roleResponse = await axios.get(keycloakRoleUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // === get policy start ====
    const keycloakPolicyUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/policy`;

    const policyResponse = await axios.get(keycloakPolicyUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // === filter policy on the basis of role start ===
    const roleBasedPolicies = policyResponse.data.filter(p => {
      if (p.config.roles) {

        const policyRoles = JSON.parse(p.config.roles);

        return policyRoles.some(policyRole =>
          roleResponse.data.some(r => r.id === policyRole.id)
        );
      }
      return false;
    });

    //==== Get permission list start ==============
    const keycloakPermissionUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/permission`;
    const permissionList = await axios.get(keycloakPermissionUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // ==== Filter permission on the basis of policy name start ===
    const cleanedPolicyNames = roleBasedPolicies.map(policy => removeLastWord(policy.name));

    const policyBasedPermissions = permissionList.data.filter(permission =>
      cleanedPolicyNames.some(cleanedName => removeLastWord(permission.name).includes(cleanedName))
    );

    const promises = policyBasedPermissions.map((permission) => permissionBasedResourceScope(permission.id, removeLastWord(permission.name), permission.name, token));
    const results = await Promise.all(promises);

    const roleData = roleResponse.data
      .map(role => {
        const rolePermissions = results.filter(permission => permission.permissionName === role.name);

        if (rolePermissions.length > 0) {
          return {
            id: role.id,
            roleName: role.name,
            [`roleScopeDetail`]: rolePermissions
          };
        }

        return null;
      })
      .filter(role => role !== null);

    res.status(200).json({
      success: true,
      message: "Role list retrive successfuly.",
      data: roleData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Method @POST
 * Description : @keycloakaddRole method use to add role. 
*/
export const keycloakaddRole = async (req, res) => {

  // Get the access token to access other APIs
  const token = await keycloakAccessToken();
  if (!token) {
    return res.status(400).json({ message: "Token is missing or invalid" });
  }

  // Extract and validate the role data from the request body
  const { role_name, description } = req.body;

  if (!role_name || typeof role_name !== 'string' || role_name.trim() === '') {
    return res.status(400).json({ message: "Role name is required" });
  }

  if (description && typeof description !== 'string') {
    return res.status(400).json({ message: "Description should be a string if provided." });
  }

  const rolePayload = {
    name: role_name.trim(),
    description: description ? description.trim() : '',
  };

  const keycloakUrl = `${serverUrl}/admin/realms/${realm}/roles`;

  try {
    // Step 1: Check if the role already exists
    const checkRoleResponse = await axios.get(keycloakUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const existingRole = checkRoleResponse.data.find(role => role.name === role_name.trim());

    if (existingRole) {
      return res.status(400).json({ message: `Role ${role_name} already exists. Please choose a different role name.` });
    }

    // Step 2: Create the role if it doesn't exist
    const response = await axios.post(keycloakUrl, rolePayload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 201) {
      res.status(201).json({
        success: true,
        message: "Role added to Keycloak successfully.",
      });
    } else {
      res.status(500).json({ success: false, message: "Failed to add role to Keycloak." });
    }
  } catch (error) {
   
    if (error.response) {
      return res.status(error.response.status).json({ success: false, message: error.response.data.message });
    } else if (error.request) {
      return res.status(500).json({ success: false, message: "No response from Keycloak server." });
    } else {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

/**
 * Method @GET
 * Description : @keycloakRoleList method use to list out the role. 
*/
export const keycloakRoleList = async (req, res) => {
  const token = await keycloakAccessToken();

  if (!token) {
    return res.status(400).json({ message: "Token is missing or invalid" });
  }

  const keycloakUrl = `${serverUrl}/admin/realms/${realm}/roles`;

  try {
    // Pagination logic
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;

    if (pageSize <= 0 || page <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page or pageSize. Both should be positive integers.',
      });
    }

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Fetch roles list from Keycloak with pagination
    const response = await axios.get(keycloakUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        first: skip,
        max: take
      }
    });

    // Handle cases where the data might be empty
    if (!response.data || response.data.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No roles found.",
        data: [],
        pagination: {
          page,
          pageSize,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // Optionally, fetch total roles count (if needed)
    const totalRolesResponse = await axios.get(keycloakUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const totalRolesCount = totalRolesResponse.data.length;

    res.status(200).json({
      success: true,
      message: "Role list retrieved successfully.",
      data: response.data,
      pagination: {
        page,
        pageSize,
        total: totalRolesCount,
        totalPages: Math.ceil(totalRolesCount / pageSize),
      },
    });

  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// update single resource and scope
export async function updateSingleResourceScopes(req, res) {
  const token = await keycloakAccessToken();

  if (!token) {
    return res.status(400).json({ message: "Token is missing or invalid" });
  }

  const data = req.body;
  const scopes = req.body?.scopes;

  try {
    const baseUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/resource`;

    // Fetch all resources
    const response = await axios.get(baseUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Find resource by name
    const resource = response.data.find(r => r.name === req.body?.name);

    if (resource) {
      const updateResponse = await axios.put(
        `${baseUrl}/${resource._id}`,
        {
          name: resource.name,
          scopes: scopes
        },
        {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }
      );
      res.status(200).json({ success: true, message: "Permission updated successfully!" });
    } else {
      res.status(404).json({ success: false, message: `Resource with name "${req.body?.name}" not found.` });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred while updating the resource.' });
  }
}

export const keycloakResourceDetail = async (req, res) => {

  const token = await keycloakAccessToken();
  const { resourceId } = req.body

  if (!token) {
    return res.status(400).json({ message: "Token is missing or invalid" });
  }
  const keycloakResourceUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/resource/${resourceId}`;

  try {
    const response = await axios.get(keycloakResourceUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    res.status(200).json({
      success: true,
      message: "Resource detail retive successfuly.",
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

