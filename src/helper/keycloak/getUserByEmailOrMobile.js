import axios from 'axios';
import keycloakConfig from '../../constants/keycloak.json' with { type: "json" };
import { getKeycloakData } from './getKeycloakData.js';

const { realm, serverUrl, client_name_id } = keycloakConfig;
export const getUserByEmailOrMobile = async (email, mobileNumber, token) => {

    const url = `${serverUrl}/admin/realms/${realm}/users`;
  
    // Fetch users based on email or mobile number
    let users = [];
    if (email) {
      users = await getKeycloakData(`${url}?email=${email}`, token);
      return users[0]
    
    } else if (mobileNumber) {
      users = await getKeycloakData(`${url}?first=0&max=1000`, token);
      return users.find(user => user?.attributes?.mobile?.includes(mobileNumber));
    }
   
  
    // Find user matching mobile number
  
  };