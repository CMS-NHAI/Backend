import {keycloakAccessToken} from "../../helper/keycloakAccessToken.js";
import axios from 'axios';
import keycloakConfig from '../../constants/keycloak.json' with {type: "json"}; 

const { realm, serverUrl } = keycloakConfig;

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
