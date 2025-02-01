import { keycloakAccessToken } from "../../helper/keycloakAccessToken.js";
import axios from 'axios';
import keycloakConfig from '../../constants/keycloak.json' with { type: "json" };

const { realm, serverUrl, client_name_id } = keycloakConfig;

// Helper function to validate role and authorization data
function validateRoleAndAuthorization(role, authorization) {
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

// Helper function to create a role
async function createRole(roleName, token) {
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

// Helper function to create resource and scopes
async function createResourceAndScopes(authorization, token) {
  const createdResources = [];

  for (let auth of authorization) {
    const { resource, scopes } = auth;

    const resourceData = { name: resource, type: 'client', scopes: scopes };

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

// Helper function to create policy
async function createPolicy(roleName, token) {
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

// Helper function to create permission
async function createPermission(roleName, policiesIds, resourceIds, token) {

  const permissionName = `${roleName} Permission`;
  const permissionPayload = {
    name: permissionName,
    policies: policiesIds,
    resources: resourceIds,
  };

  try {
    const keycloakPermissionUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/permission/resource`;

    // Step 1: Check if the permission already exists
    const checkPermissionResponse = await axios.get(keycloakPermissionUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const existingPermission = checkPermissionResponse.data.find(permission => permission.name === permissionName.trim());
    if (existingPermission) {
      throw new Error(`Permission '${permissionName}' already exists. Please choose a different permission name.`);
    }

    // Step 2: Create the permission if it doesn't exist
    const response = await axios.post(keycloakPermissionUrl, permissionPayload, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });

    return response.data; // Return the created permission's data
  } catch (error) {
    throw new Error(error.response ? error.response.data.message : error.message);
  }
}

// Create role, resources, scopes, policy, permission
export const keycloakaddRoleResourceScopePolicyPermission = async (req, res) => {
  const token = await keycloakAccessToken();

  if (!token) {
    return res.status(400).json({ msg: "Token is missing or invalid" });
  }

  const { role, authorization } = req.body;

  try {
    // Step 1: Validate the role and authorization data
    validateRoleAndAuthorization(role, authorization);

    // Step 2: Create the role
    const roleDetail = await createRole(role, token);

    // Step 3: Create resources and scopes
    const resourceDetails = await createResourceAndScopes(authorization, token);
    const allResourceIds = resourceDetails.map(resource => resource._id);

    // Step 4: Create the policy
    const policyDetail = await createPolicy(role, token);
    const allPolicyIds = [policyDetail.id];

    // Step 5: Create the permission
    const permissionDetail = await createPermission(role, allPolicyIds, allResourceIds, token);

    res.status(201).json({
      success: true,
      msg: "Role & Permission added successfully.",
      permissionDetail,
    });
  } catch (error) {
    // Handle validation or API errors
    res.status(500).json({ success: false, msg: error.message });
  }
};

// update multiple resource and scope
export async function updateMultipleResourceScopes(req, res) {

  const token = await keycloakAccessToken();

  if (!token) {
    return res.status(400).json({ msg: "Token is missing or invalid" });
  }

  const data = req.body.authorization;

  // Loop through the resources to update
  for (let i = 0; i < data.length; i++) {
    const { resource, scopes } = data[i];

    try {
      const baseUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/resource`;

      // Get all resources
      const response = await axios.get(baseUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Find the resource by its name or ID
      const resourceToUpdate = response.data.find(r => r.name === resource || r.id === resource);

      if (resourceToUpdate) {
        // Update the resource's scopes
        const updateResponse = await axios.put(`${baseUrl}/${resourceToUpdate._id}`,
        {
          scopes: scopes
        }, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        console.log(`Successfully updated resource ${resource} with scopes ${scopes}`);
      } else {
        console.log(`Resource with name "${resource}" not found in Keycloak.`);
      }
    } catch (error) {
      // Improved error handling: log status code and error message
      if (error.response) {
        console.error(`Error updating resource ${resource}:`, error.response.status, error.response.data);
      } else {
        console.error(`Error updating resource ${resource}:`, error.message);
      }
    }
  }

  return res.status(200).json({ msg: "Resource updates completed" });
}

// update multiple resource and scope
export async function updateSingleResourceScopes(req, res) {
  const token = await keycloakAccessToken();

  if (!token) {
    return res.status(400).json({ msg: "Token is missing or invalid" });
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

      // Send a successful response with only relevant data
      res.status(200).json({ success: true, msg:"Permission updated successfully!" });
    } else {
      res.status(404).json({ success: false, message: `Resource with name "${req.body?.name}" not found.` });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred while updating the resource.' });
  }
}

// ================================================================================================

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
          msg: "Role added to Keycloak successfully.",
        });
      } else {
        res.status(500).json({ success: false, msg: "Failed to add role to Keycloak." });
      }
    } catch (error) {
      // Handle axios errors
      if (error.response) {
        // Server returned an error
        return res.status(error.response.status).json({ success: false, msg: error.response.data.message });
      } else if (error.request) {
        // No response from server
        return res.status(500).json({ success: false, msg: "No response from Keycloak server." });
      } else {
        // Other error
        return res.status(500).json({ success: false, msg: error.message });
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
    const response = await axios.get(keycloakUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    res.status(200).json({
      success: true,
      msg: "Role list retive successfuly.",
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

// Helper function to create scopes
// async function createScopes(authArray, accessToken) {
//   const allScopes = [];
  
//     // Loop through each authorization and its scopes
//     authArray.forEach(item => {
//       item.scopes.forEach(scope => {
//         // Add the scope to the array if it's not already there based on the scope id
//         if (!allScopes.some(existingScope => existingScope.id === scope.id)) {
//           allScopes.push(scope);
//         }
//       });
//     });

//   const keycloakScopeUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/scope`;
//   for (const scope of allScopes) {

//     try {
//       const response = await axios.post(keycloakScopeUrl, scope.name, {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.status === 201) {
//         console.log(`Scope ${scope.name} created successfully!`);
//       } else {
//         console.error(`Failed to create ${scope.name}:`, response.status, response.data);
//       }
//     } catch (error) {
//       console.error(`Error creating ${scope.name}:`, error.response.data);
//     }
//   }
// }
