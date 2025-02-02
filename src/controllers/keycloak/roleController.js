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

const { realm, serverUrl, client_name_id } = keycloakConfig;

// Create role, resources, scopes, policy, permission
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
        role:role,
        authorization:permissionDetail
       }

    res.status(201).json({
      success: true,
      message: "Role & Permission added successfully.",
      data:data
    });
  } catch (error) {
    // Handle validation or API errors
    res.status(500).json({ success: false, msg: error.message });
  }
};

// update resource scope
export async function updateResourceScopes(req, res) {

  const token = await keycloakAccessToken();

  if (!token) {
    return res.status(400).json({ msg: "Token is missing or invalid" });
  }

  const data = req.body;
  const permissionId =  req.body.id;

  try {
    const baseUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/permission/scope`;
    
      const updateResponse = await axios.put(
        `${baseUrl}/${permissionId}`,
        data,
        {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }
      );

      res.status(200).json({ success: true, message:"Permission updated successfully!" });

  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred while updating the resource.' });
  }
}

export const keycloakRoleResourecScopeList = async (req, res) => {

  const token = await keycloakAccessToken();

if (!token) {
  return res.status(400).json({ message: "Token is missing or invalid" });
}

try {

  // =========== get role start =========================
  const keycloakRoleUrl = `${serverUrl}/admin/realms/${realm}/roles`;
  const roleResponse = await axios.get(keycloakRoleUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  // =========== get role end ===========================

  // =========== get policy start =======================
    const keycloakPolicyUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/policy`;

    const policyResponse = await axios.get(keycloakPolicyUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  
  // =========== get policy end ==========================

  // filter policy on the basis of role start
  const roleBasedPolicies = policyResponse.data.filter(p => {
    if (p.config.roles) {
      // Parse the roles in the policy's config
      const policyRoles = JSON.parse(p.config.roles);
      
      // Check if any of the roles in the policy match any of the role IDs in the role array
      return policyRoles.some(policyRole =>
        roleResponse.data.some(r => r.id === policyRole.id)
      );
    }
    return false;
  });
   // filter policy on the basis of role end

  //==== Get permission list start ==============
  const keycloakPermissionUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/permission`;
  const permissionList = await axios.get(keycloakPermissionUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

   //==== Get permission list start ==============

  // ==== Filter permission on the basis of policy name start ===
  const cleanedPolicyNames = roleBasedPolicies.map(policy => removeLastWord(policy.name));

  const policyBasedPermissions = permissionList.data.filter(permission => 
    cleanedPolicyNames.some(cleanedName => removeLastWord(permission.name).includes(cleanedName))
  );

  // ==== Filter permission on the basis of policy name end ===

  // ====================================
  const promises = policyBasedPermissions.map((permission) => permissionBasedResourceScope(permission.id, removeLastWord(permission.name), permission.name, token));
  const results = await Promise.all(promises);
  
  
// ====================================
const mergedPermissions = results.reduce((acc, curr) => {
  const existing = acc.find(p => p.permissionName === curr.permissionName);

  if (existing) {
    // Merge permissionDetails for the same permissionName
    existing.mergedResult.permissionDetail = [
      ...existing.mergedResult.permissionDetail,
      ...curr.mergedResult.permissionDetail
    ];
  } else {
    // If permissionName does not exist, add it
    acc.push({
      permissionName: curr.permissionName,
      mergedResult: {
        permissionDetail: [...curr.mergedResult.permissionDetail]
      }
    });
  }
  return acc;
}, []);

// ===================================

const roleDAta =  roleResponse.data
    .map(role => {
      // Find permissions that match the role's name
      const rolePermissions = results.filter(permission => permission.permissionName === role.name);
 
      // Return the role only if it has matching permissions (non-empty data)
      if (rolePermissions.length > 0) {
        return {
          id: role.id,
          roleName: role.name,
          [`roleScopeDetail`]: rolePermissions
        };
      }
      // Exclude roles with no matching permissions
      return null;
    })
    .filter(role => role !== null); // Filter out null values (roles without matching permissions)
//====================================

// =================================================
// Merge permissionName and role information start
// const mergedWithRoleData = mergedPermissions.map(permission => {
//   const matchingRole = roleResponse.data.find(role => role.name === permission.permissionName);
  
//   if (matchingRole) {
//     // Add the role and id to the permission object
//     permission.role = matchingRole.name;
//     permission.id = matchingRole.id;
//   }

//   return permission;
// });

// const updatedData = mergedWithRoleData.map(item => {
//   return {
//     id: item.id,
//     role: item.role,
//       //permissionName: item.permissionName,
//       authorization: item.mergedResult.permissionDetail,
      
//   };
// });

// Merge permissionName and role information end

// =====================================================================

// =====================================================================

  res.status(200).json({
    success: true,
    message: "Role list retrive successfuly.",
    data: roleDAta,
  });
} catch (error) {
  res.status(500).json({ success: false, message: error.message });
}
};
//===========================================

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
      res.status(200).json({ success: true, message:"Permission updated successfully!" });
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
  return res.status(400).json({ msg: "Token is missing or invalid" });
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
    msg: "Resource detail retive successfuly.",
    data: response.data,
  });
} catch (error) {
  res.status(500).json({ success: false, msg: error.message });
}
};

// =========================================

export const keycloakaddRole = async (req, res) => {

    // Get the access token to access other APIs
    const token = await keycloakAccessToken();
    if (!token) {
      return res.status(400).json({ msg: "Token is missing or invalid" });
    }
  
    // Extract and validate the role data from the request body
    const { role_name, description } = req.body;
  
    if (!role_name || typeof role_name !== 'string' || role_name.trim() === '') {
      return res.status(400).json({ msg: "Role name is required" });
    }
  
    if (description && typeof description !== 'string') {
      return res.status(400).json({ msg: "Description should be a string if provided." });
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
        return res.status(400).json({ msg: `Role '${role_name}' already exists. Please choose a different role name.` });
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
      // Handle axios errors
      if (error.response) {
        // Server returned an error
        return res.status(error.response.status).json({ success: false, message: error.response.data.message });
      } else if (error.request) {
        // No response from server
        return res.status(500).json({ success: false, message: "No response from Keycloak server." });
      } else {
        // Other error
        return res.status(500).json({ success: false, message: error.message });
      }
    }
  };
  
  export const keycloakRoleList = async (req, res) => {
    const token = await keycloakAccessToken();
  
    if (!token) {
      return res.status(400).json({ msg: "Token is missing or invalid" });
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
          first: skip,  // Adjusting pagination params based on Keycloak API
          max: take     // Number of roles to fetch
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
  
      console.log("Total roles response:", totalRolesResponse.data);
  
      const totalRolesCount = totalRolesResponse.data.length; // Adjust this logic based on Keycloak's response
  
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
  
  

