
import axios from 'axios';
import keycloakConfig from '../../constants/keycloak.json' with {type: "json"}; 

const { realm, serverUrl, client_name_id } = keycloakConfig;
  
export const getScopeList = async (token) => {

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
  
   return response.data
   
  } catch (error) {
    throw new Error(error.response ? error.response.data.message : error.message);
  }
};
