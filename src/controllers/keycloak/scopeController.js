import {keycloakAccessToken} from "../../helper/keycloakAccessToken.js";
import axios from 'axios';
import keycloakConfig from '../../constants/keycloak.json' with {type: "json"}; 

const { realm, serverUrl, client_name_id } = keycloakConfig;

export const keycloakaddScope = async (req, res) => {
   

    // Get the access token to access other APIs
    const token = await keycloakAccessToken();
    if (!token) {
      return res.status(400).json({ msg: "Token is missing or invalid" });
    }
  
    // Extract and validate the scope data from the request body
    const { name } = req.body;
  
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ msg: "Scope name is required" });
    }
  
    const scopePayload = {
      name: name.trim(),
    };
  
    const keycloakUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/scope`;
  
    try {

      // Check if the scope already exists
      const checkScopeResponse = await axios.get(keycloakUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const existingScope = checkScopeResponse.data.find(scope => scope.name === name.trim());
  
      if (existingScope) {
        return res.status(400).json({ msg: `Scope '${name}' already exists. Please choose a different scope name.` });
      }
  
      // Create the scope if it doesn't exist
      const response = await axios.post(keycloakUrl, scopePayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 201) {
        res.status(201).json({
          success: true,
          msg: "Scope added to Keycloak successfully.",
        });
      } else {
        res.status(500).json({ success: false, msg: "Failed to add Scope to Keycloak." });
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
        return res.status(500).json({ success: false, msg: error.message });
      }
    }
  };
  
export const keycloakScopeList = async (req, res) => {
    const token = await keycloakAccessToken();

  if (!token) {
    return res.status(400).json({ msg: "Token is missing or invalid" });
  }
  const keycloakUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/scope`;

  try {
    const response = await axios.get(keycloakUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    res.status(200).json({
      success: true,
      msg: "Scope list retive successfuly.",
      data: response.data,
    });
  } catch (error) {
    
    if (error.response) {
      // Server responded with an error
      return res.status(error.response.status).json({
        success: false,
        msg: error.response.data.message || "Error retrieving data from Keycloak.",
      });
    } else if (error.request) {
      return res.status(500).json({
        success: false,
        msg: "No response from Keycloak server. Please check the server status.",
      });
    } else {
      // Unknown error
      return res.status(500).json({
        success: false,
        msg: `Error: ${error.message}`,
      });
    }
  }
};
