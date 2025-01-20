import {keycloakAccessToken} from "../../helper/keycloakAccessToken.js";
import axios from 'axios';
import keycloakConfig from '../../constants/keycloak.json' with {type: "json"}; 

const { realm, serverUrl } = keycloakConfig;

export const keycloakaddUser = async (req, res) => {

    // Get the access token to access other APIs
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

      // Evalution part start
      const apiUrl = `${serverUrl}/admin/realms/${realm}/clients/f251a5af-8b61-49fb-a8af-3d7e391a34fb/authz/resource-server/policy/evaluate`;
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
     
      res.status(200).json({
        success: true,
        msg: "User detail retrived successfully!",
        userDetail:userDetails,
        userRole: userWithRoles?.roles?.realmRoles,
        userAuthorization: response?.data?.rpt?.authorization,
      });
    } else {
     
      res
        .status(404)
        .json({ msg: "No user found with the given mobile number." });
    }
  } catch (error) {
   
    return res.status(500).json({ msg: error.message || "An error occurred" });
  }


};
