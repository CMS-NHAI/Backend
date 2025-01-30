import {keycloakAccessToken} from "../../helper/keycloak/keycloakAccessToken.js";
import axios from 'axios';
import keycloakConfig from '../../constants/keycloak.json' with {type: "json"}; 

const { realm, serverUrl, client_name_id } = keycloakConfig;

// export const keycloakaddUser = async (req, res) => {

//     // Get the access token to access other APIs
//     const token = await keycloakAccessToken();

//     if (!token) {
//       return res.status(400).json({ msg: "Token is missing or invalid" });
//     }
  
//     const {
//         username,
//         email,
//         firstName,
//         lastName,
//         mobile,
//         division,
//         designation,
//       } = req.body;
    
//       const userPayload = {
//         username: username,
//         email: email,
//         firstName: firstName,
//         lastName: lastName,
//         emailVerified: true,
//         enabled: true,
//         attributes: {
//           mobile: mobile,
//           division: division,
//           designation: designation,
//         },
//       };
    
//       const keycloakUrl = `${serverUrl}/admin/realms/${realm}/users`;
    
//       try {
//         const response = await axios.post(keycloakUrl, userPayload, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         res.status(201).json({
//           success: true,
//           msg: "User added to Keycloak successfully!",
//         });
//       } catch (error) {
//         res.status(500).json({
//           success: false,
//           msg: error.message,
//         });
//       }
//   };
  
// export const keycloakUserList = async (req, res) => {
   
//     const token = await keycloakAccessToken();

//   if (!token) {
//     return res.status(400).json({ msg: "Token is missing or invalid" });
//   }

//   // const mobileNumber = req.body.mobile;
//   const mobileNumber = req.body.mobile; // Mobile number with country code

//   if (!mobileNumber) {
//     return res.status(400).json({ msg: "Mobile number is required" });
//   }

//   const url = `${serverUrl}/admin/realms/${realm}/users`;

//   try {
//     // Fetch all users and filter by mobile number manually
//     const response = await axios.get(`${url}?first=0&max=1000`, {
//       // Adjust pagination parameters if needed
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     // Filter users based on the provided mobile number
//     const user = response.data.find(
//       (u) =>
//         u.attributes &&
//         u.attributes.mobile &&
//         u.attributes.mobile.includes(mobileNumber)
//     );

//     if (user) {
//       // Fetch user roles
//       const rolesResponse = await axios.get(`${url}/${user.id}/role-mappings`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       // Extract roles from the response
//       const userRoles = {
//         realmRoles: rolesResponse.data.realmMappings || [],
//         clientRoles: rolesResponse.data.clientMappings || {},
//       };

//       // Extract client roles correctly, considering mappings structure
//       const clientRolesWithPermissions = Object.entries(
//         userRoles.clientRoles
//       ).map(([clientId, roles]) => {
//         // console.log(`Client ID: ${clientId}`, roles);

//         // Ensure `roles` is an array and contains roles
//         if (Array.isArray(roles.mappings)) {
//           return {
//             clientId,
//             roles: roles.mappings.map((role) => role.name), // Extract the role names
//           };
//         } else {
//           // console.log(`No roles found for client ${clientId}`);
//           return {
//             clientId,
//             roles: [], // Empty array if no roles assigned
//           };
//         }
//       });

//       // Evalution part start
//       const apiUrl = `${serverUrl}/admin/realms/${realm}/clients/f251a5af-8b61-49fb-a8af-3d7e391a34fb/authz/resource-server/policy/evaluate`;
//       const response = await axios.post(
//         apiUrl,
//         {
//           userId: user.id,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`, // Authorization header with Bearer token
//             "Content-Type": "application/json", // Ensure the request body is JSON
//           },
//         }
//       );
//       // Evaluation part end

//       // Combine user data with roles and permissions
//       const userWithRoles = {
//         roles: {
//           realmRoles: userRoles.realmRoles.map((role) => role.name), // Map realm roles to their names
//           clientRoles: clientRolesWithPermissions, // Include client roles with permissions
//         },
//       };

//       // == user detail start
//       const userDetails= {
//         "id": user.id,
//         "username": user.username,
//         "firstName": user.firstName,
//         "email": user.email,
//         "emailVerified": true,
//         "attributes": {
//             "mobile": [
//               user.attributes.mobile
//             ]
//         },
//     }
   
//       // == user detail end
     
//       res.status(200).json({
//         success: true,
//         msg: "User detail retrived successfully!",
//         userDetail:userDetails,
//         userRole: userWithRoles?.roles?.realmRoles,
//         userAuthorization: response?.data?.rpt?.authorization,
//       });
//     } else {
     
//       res
//         .status(404)
//         .json({ msg: "No user found with the given mobile number." });
//     }
//   } catch (error) {
   
//     return res.status(500).json({ msg: error.message || "An error occurred" });
//   }


// };


// ====================
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
  } = req.user;

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
      msg: "User added to Keycloak successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }

  
};

export const keycloakUserList = async (req, res) => {
  const token = await keycloakAccessToken();

  if (!token) {
    return res.status(400).json({ msg: "Token is missing or invalid" });
  }
  const keycloakUrl = `${serverUrl}/admin/realms/${realm}/users`;
  try {
    const response = await axios.get(keycloakUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    res.status(200).json({
      success: true,
      msg: "List of user retrive successfuly.",
      data: response.data,
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
        msg: "User detail retrived successfully!",
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

  if (!userId || !roleName) {
    return res
      .status(400)
      .json({ message: "UserId and RoleName are required" });
  }

  try {
    // Step 2: Get the role by name
    const rolesResponse = await axios.get(
      `${serverUrl}/admin/realms/${realm}/roles`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const role = rolesResponse.data.find((r) => r.name === roleName);
    if (!role) {
      return res.status(404).json({ message: `Role ${roleName} not found` });
    }

    // Step 3: Assign the role to the user
    await axios.post(
      `${serverUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`,
      [
        {
          id: role.id,
          name: role.name,
        },
      ],
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res
      .status(200)
      .json({ message: `Role ${roleName} assigned to user successfuly.` });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

export const unassignRoleToKeycloakUser = async (req, res) => {
  const token = await keycloakAccessToken();

  if (!token) {
    return res.status(400).json({ msg: "Token is missing or invalid" });
  }

  const { userId, roleName } = req.body;

  if (!userId || !roleName) {
    return res
      .status(400)
      .json({ message: "UserId and RoleName are required" });
  }

  const roleUrl = `${serverUrl}/admin/realms/${realm}/roles/${roleName}`;
  let role;

  try {
    const roleResponse = await axios.get(roleUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    role = roleResponse.data; // Role object to be used for unassignment
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }

  // Unassign the role from the user
  const unassignUrl = `${serverUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`;

  try {
    const response = await axios.delete(unassignUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: [role], // Passing the role to unassign
    });
    res
      .status(200)
      .json({ success: true, msg: "Role unassigned successfully" });
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

export const keycloakUserPermissionDetail = async (req, res) => {
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

      console.log("userRoles ===>>>", userRoles)

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
      res.status(200).json({
        success: true,
        msg: "User detail retrived successfully!",
        userDetail:userDetails,
        userRole: userWithRoles?.roles?.realmRoles,
        userAuthorization: response?.data?.rpt?.authorization,
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
    res.status(200).json({ success: true, msg: "User transfer from one division to another successfully." });

  } catch (error) {
    // Catch and handle errors
    console.error("Error updating user attribute:", error.message);
    res.status(500).json({ success: false, msg: error.message });
  }
};
