import {keycloakAccessToken} from "../../helper/keycloakAccessToken.js";
import axios from 'axios';
import keycloakConfig from '../../constants/keycloak.json' with {type: "json"}; 
import { allScopes } from "../../constants/keycloak/allScopes.js";
import { STATUS_CODES } from "../../constants/statusCodesConstant.js";
import { RESPONSE_MESSAGES } from "../../constants/responseMessages.js";

const { realm, serverUrl, client_name_id } = keycloakConfig;

export const keycloakaddResource = async (req, res) => {
   

    // Get the access token to access other APIs
    const token = await keycloakAccessToken();
    if (!token) {
      return res.status(400).json({ msg: "Token is missing or invalid" });
    }
  
    // Extract and validate the resource data from the request body
    const { name } = req.body;
  
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ msg: "Resource name is required" });
    }
  
    const resourcePayload = req.body
    
    const keycloakUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/resource`;
    console.log("keycloakUrl====>>>", keycloakUrl)
  
    try {

      // Check if the resource already exists
      const checkResourceResponse = await axios.get(keycloakUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const existingResource = checkResourceResponse.data.find(resource => resource.name === name.trim());
  
      if (existingResource) {
        return res.status(400).json({ msg: `Resource '${name}' already exists. Please choose a different resource name.` });
      }
  
      // Create the resource if it doesn't exist
      const response = await axios.post(keycloakUrl, resourcePayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 201) {
        res.status(201).json({
          success: true,
          msg: "Resource added to Keycloak successfully.",
        });
      } else {
        res.status(500).json({ success: false, msg: "Failed to add resource to Keycloak." });
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
  
export const keycloakResourceList = async (req, res) => {
    const token = await keycloakAccessToken();

  if (!token) {
    return res.status(400).json({ msg: "Token is missing or invalid" });
  }
  const keycloakUrl = `${serverUrl}/admin/realms/${realm}/clients/${client_name_id}/authz/resource-server/resource`;

  try {
    const response = await axios.get(keycloakUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    res.status(200).json({
      success: true,
      msg: "Resource list retive successfuly.",
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

/**
 * Method @GET
 * Description : Get specific scope under resource
*/
export const keycloakGetResourceScope = async (req, res) => {
  try {
    res.status(STATUS_CODES.OK).json({
      success: RESPONSE_MESSAGES.SUCCESS.status,
      message: RESPONSE_MESSAGES.SUCCESS.RESOURCE_SCOPE_LIST,
      date:allScopes
     
    });
  } catch (error) {
    // Handle validation or API errors
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
};
