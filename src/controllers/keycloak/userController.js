import {keycloakAccessToken} from "../../helper/keycloak/keycloakAccessToken.js";
import axios from 'axios';
import keycloakConfig from '../../constants/keycloak.json' with {type: "json"}; 

const { realm, serverUrl, client_name_id } = keycloakConfig;

export const keycloakAddUser = async (req, res) => {
  const token = await keycloakAccessToken();
  if (!token) {
    return res.status(400).json({ msg: "Token is missing or invalid" });
  }

  const {
    username,
    email,
    firstName,
    lastName,
    mobile,
    division,
    designation,
  } = req.body;

  const userPayload = {
    username: username,
    email: email,
    firstName: firstName,
    lastName: lastName,
    emailVerified: true,
    enabled: true,
    attributes: {
      mobile: mobile,
      division: division,
      designation: designation,
    },
  };

  const keycloakUrl = `${serverUrl}/admin/realms/${realm}/users`;

  try {
    const response = await axios.post(keycloakUrl, userPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    res.status(201).json({
      success: true,
      message: "User added to Keycloak successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  
};

export const keycloakUserList = async (req, res) => {
  const token = await keycloakAccessToken();

  if (!token) {
    return res.status(400).json({ msg: "Token is missing or invalid" });
  }

  const keycloakUrl = `${serverUrl}/admin/realms/${realm}/users`;

  // Get pagination parameters from query (default to page 1 and page size of 10)
  const { page = 1, size = 10 } = req.query;
  
  // Calculate first based on page and size
  const first = (page - 1) * size;

  try {
    const response = await axios.get(keycloakUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        first, // start index (first)
        max: size, // number of users per page (max)
      },
    });

    res.status(200).json({
      success: true,
      message: "List of users retrieved successfully.",
      data: response.data,
      pagination: {
        page: parseInt(page),
        size: parseInt(size),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};


export const keycloakUserDetail = async (req, res) => {
  const token = await keycloakAccessToken();
 
  if (!token) {
    return res.status(400).json({ msg: "Token is missing or invalid" });
  }

  // const mobileNumber = req.body.mobile;
  const mobileNumber = req.body.mobile; // Mobile number with country code

  if (!mobileNumber) {
    return res.status(400).json({ msg: "Mobile number is required" });
  }

  const url = `${serverUrl}/admin/realms/${realm}/users`;

  try {
    // Fetch all users and filter by mobile number manually
    const response = await axios.get(`${url}?first=0&max=1000`, {
      // Adjust pagination parameters if needed
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Filter users based on the provided mobile number
    const user = response.data.find(
      (u) =>
        u.attributes &&
        u.attributes.mobile &&
        u.attributes.mobile.includes(mobileNumber)
    );

    if (user) {
      // Fetch user roles
      const rolesResponse = await axios.get(`${url}/${user.id}/role-mappings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Extract roles from the response
      const userRoles = {
        realmRoles: rolesResponse.data.realmMappings || [],
        clientRoles: rolesResponse.data.clientMappings || {},
      };

      // Extract client roles correctly, considering mappings structure
      const clientRolesWithPermissions = Object.entries(
        userRoles.clientRoles
      ).map(([clientId, roles]) => {
        // console.log(`Client ID: ${clientId}`, roles);

        // Ensure `roles` is an array and contains roles
        if (Array.isArray(roles.mappings)) {
          return {
            clientId,
            roles: roles.mappings.map((role) => role.name), // Extract the role names
          };
        } else {
          // console.log(`No roles found for client ${clientId}`);
          return {
            clientId,
            roles: [], // Empty array if no roles assigned
          };
        }
      });

      // Combine user data with roles and permissions
      const userWithRoles = {
        ...user,
        roles: {
          realmRoles: userRoles.realmRoles.map((role) => role.name), // Map realm roles to their names
          clientRoles: clientRolesWithPermissions, // Include client roles with permissions
        },
      };

      // Send response with user data and roles
      res.status(200).json({
        success: true,
        message: "User detail retrived successfully!",
        data: userWithRoles,
      });
    } else {
      // console.log("No user found with the given mobile number.");
      res
        .status(404)
        .json({ msg: "No user found with the given mobile number." });
    }
  } catch (error) {
    // console.error('Error:', error.message || (error.response ? error.response.data : error));
    return res.status(500).json({ msg: error.message || "An error occurred" });
  }
};

export const assignRoleToKeycloakUser = async (req, res) => {
  const token = await keycloakAccessToken();
  if (!token) {
    return res.status(400).json({ msg: "Token is missing or invalid" });
  }

  const { userId, roleName } = req.body;

  if (!userId || !roleName || roleName.length === 0) {
    return res
      .status(400)
      .json({ message: "UserId and roleName are required" });
  }

  try {
    // Step 2: Get the roles by name
    const rolesResponse = await axios.get(
      `${serverUrl}/admin/realms/${realm}/roles`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const roles = rolesResponse.data;

    // Map roleName to role objects (extract role names)
    const rolesToAssign = roleName.map((roleObj) => {
      const role = roles.find((r) => r.name === roleObj.name);
      if (!role) {
        throw new Error(`Role ${roleObj.name} not found`);
      }
      return {
        id: role.id,
        name: role.name,
      };
    });

    // Step 3: Assign the roles to the user
    await axios.post(
      `${serverUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`,
      rolesToAssign,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res
      .status(200)
      .json({ success:true, message: `Roles ${roleName.map((r) => r.name).join(", ")} assigned to user successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

export const unassignRolesToKeycloakUser = async (req, res) => {
  const token = await keycloakAccessToken();

  if (!token) {
    return res.status(400).json({ msg: "Token is missing or invalid" });
  }

  const { userId, roleNames } = req.body;  // Expecting an array of role names

  if (!userId || !Array.isArray(roleNames) || roleNames.length === 0) {
    return res
      .status(400)
      .json({ message: "UserId and an array of RoleNames are required" });
  }

  const roles = [];

  try {
    // Fetch the roles from Keycloak for each role name
    for (let roleName of roleNames) {
      const roleUrl = `${serverUrl}/admin/realms/${realm}/roles/${roleName}`;
      const roleResponse = await axios.get(roleUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (roleResponse.data) {
        roles.push(roleResponse.data);
      }
    }

    if (roles.length !== roleNames.length) {
      return res.status(404).json({
        success: false,
        message: "One or more roles not found",
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }

  // Unassign the roles from the user
  const unassignUrl = `${serverUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`;

  try {
    const response = await axios.delete(unassignUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: roles,  // Passing the array of roles to unassign
    });
    res
      .status(200)
      .json({ success: true, message: "Roles unassigned successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const keycloakUserPermissionDetail = async (req, res) => {
  const token = await keycloakAccessToken();
 
  if (!token) {
    return res.status(400).json({ msg: "Token is missing or invalid" });
  }

  // const mobileNumber = req.body.mobile;
  const mobileNumber = req.body.mobile; // Mobile number with country code
 
console.log(mobileNumber,"mobileNumber>>>")
  if (!mobileNumber) {
    return res.status(400).json({ msg: "Mobile number is required" });
  }

  const url = `${serverUrl}/admin/realms/${realm}/users`;

  try {
    // Fetch all users and filter by mobile number manually
    const response = await axios.get(`${url}?first=0&max=1000`, {
      // Adjust pagination parameters if needed
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Filter users based on the provided mobile number
    const user = response.data.find(
      (u) =>
        u.attributes &&
        u.attributes.mobile &&
        u.attributes.mobile.includes(mobileNumber)
    );
    
    if (user) {
      // Fetch user roles
      const rolesResponse = await axios.get(`${url}/${user.id}/role-mappings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      

      // Extract roles from the response
      const userRoles = {
        realmRoles: rolesResponse.data.realmMappings || [],
        clientRoles: rolesResponse.data.clientMappings || {},
      };

      // Extract client roles correctly, considering mappings structure
      const clientRolesWithPermissions = Object.entries(
        userRoles.clientRoles
      ).map(([clientId, roles]) => {
        // console.log(`Client ID: ${clientId}`, roles);

        // Ensure `roles` is an array and contains roles
        if (Array.isArray(roles.mappings)) {
          return {
            clientId,
            roles: roles.mappings.map((role) => role.name), // Extract the role names
          };
        } else {
          // console.log(`No roles found for client ${clientId}`);
          return {
            clientId,
            roles: [], // Empty array if no roles assigned
          };
        }
      });

      // Evalution part start
      const apiUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/policy/evaluate`;
      const response = await axios.post(
        apiUrl,
        {

          userId: user.id,
          roleIds:["b6201b75-17cc-4d6d-99b5-610a18c1aa25"],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Authorization header with Bearer token
            "Content-Type": "application/json", // Ensure the request body is JSON
          },
        }
      );
      // Evaluation part end

      // Combine user data with roles and permissions
      const userWithRoles = {
        roles: {
          realmRoles: userRoles.realmRoles.map((role) => role.name), // Map realm roles to their names
          clientRoles: clientRolesWithPermissions, // Include client roles with permissions
        },
      };

      // == user detail start
      const userDetails= {
        "id": user.id,
        "username": user.username,
        "firstName": user.firstName,
        "email": user.email,
        "emailVerified": true,
        "attributes": {
            "mobile": [
              user.attributes.mobile
            ]
        },
    }
   
      // == user detail end
      // Send response with user data and roles

    // filtering data as per the requirement start
    const roleList = userWithRoles?.roles?.realmRoles
    const authorization = response?.data?.results
     console.log("userWithRoles?.roles?.realmRoles =====>>>",  userWithRoles?.roles?.realmRoles)
     console.log("response?.data?.results =====>>>",  response?.data?.results)
     const finalOutput =[]

     // Function to filter policy names based on role list
     const groupedPolicies = authorization.map(resource => {

      const matchingPolicies = resource.policies.filter(policyObj => {

          const policyName = policyObj.policy.name;
          const lastWord = policyName.split(' '); // Extract the last word from policy name
          lastWord.pop();  
          let lastWords = lastWord.join(' '); 
          return roleList.includes(lastWords); // Check if last word matches any role in the roleList
      })
      // return finalOutput
      return {
          // resource: resource.resource.name,
        
          policies: matchingPolicies
      };
  }).filter(group => group.policies.length > 0); // Remove any groups with no matching policies

// ========================================

const groupedData = groupedPolicies.reduce((acc, obj) => {
  obj.policies.forEach(policyWrapper => {
      const { resources, scopes } = policyWrapper.policy;

      resources.forEach(resource => {
          const existingResource = acc.find(item => item.resource === resource);
          if (existingResource) {
              // If resource already exists, merge scopes
              existingResource.scope = [...new Set([...existingResource.scope, ...scopes])];
          } else {
              // If resource doesn't exist, create new entry
              acc.push({ resource, scope: [...scopes] });
          }
      });
  });
  return acc;
}, []);

     // filtering data as per the requirement end
      res.status(200).json({
        success: true,
        message: "User detail retrived successfully!",
        userDetail:userDetails,
        userRole: userWithRoles?.roles?.realmRoles,
        userAuthorization: groupedData
        // userAuthorization: response?.data?.results
       // userAuthorization: response?.data?.rpt?.authorization,
      });
    } else {
      res.status(404).json({ msg: "No user found with the given mobile number." });
    }
  } catch (error) {
    // console.error('Error:', error.message || (error.response ? error.response.data : error));
    return res.status(500).json({ msg: error.message || "An error occurred" });
  }
};

export const updateUserAttributeOnKeycloak = async (req, res) => {
  try {
    const token = await keycloakAccessToken();
    if (!token) {
      return res.status(400).json({ msg: "Token is missing or invalid" });
    }

    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    // Step 1: Fetch existing user data from Keycloak (including username, email, etc.)
    const keycloakApiUrlGet = `${serverUrl}/admin/realms/${realm}/users/${userId}`;
    const getUserResponse = await axios.get(keycloakApiUrlGet, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    // Step 2: Preserve all current fields (including built-in fields like email, firstName, etc.)
    const userData = getUserResponse.data;
    const currentAttributes = userData.attributes || {};
    const { username, email, firstName, lastName, mobile } = userData;

    // Step 3: Update only the fields you want to change (e.g., division, designation)
    // If division is provided, update it, else retain the current value
    if (division) currentAttributes.division = division;
    if (designation) currentAttributes.designation = designation;

    // Step 4: Send the PUT request to update the user's attributes with the preserved data
    const keycloakApiUrlPut = `${serverUrl}/admin/realms/${realm}/users/${userId}`;
    await axios.put(
      keycloakApiUrlPut,
      {
        username,          // Keep the username the same
        email,             // Keep the email the same
        firstName,         // Keep the first name the same
        lastName,          // Keep the last name the same
        mobile,            // Keep the mobile the same
        attributes: currentAttributes // Only update the fields you want (division, designation)
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Step 5: Send success response
    res.status(200).json({ success: true, message: "User transfer from one division to another successfully." });

  } catch (error) {
    // Catch and handle errors
    console.error("Error updating user attribute:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
