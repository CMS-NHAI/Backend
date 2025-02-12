import { keycloakAccessToken } from "../../helper/keycloak/keycloakAccessToken.js";
import keycloakConfig  from '../../constants/keycloak.json' with {type: "json"};
const { realm, serverUrl } = keycloakConfig;
import axios from "axios";

export const keycloakAddUser = async (userData) => {
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
    } = userData;
  
    const userPayload = {
      username: email,
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
     return {
        success: true,
        message: "User added to Keycloak successfully!",
      }
    } catch (error) {
    throw new Error(error)
    }
  };