import express from 'express';
import session from 'express-session';
import Keycloak from 'keycloak-connect'
import axios from 'axios'
import keycloakConfig from '../constants/keycloak.json' with {type: "json"};

const app = express();

// Initialize Keycloak middleware and session storage
const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

app.use(
  session({
    secret: keycloakConfig.credentials.clientSecret,
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

app.use(keycloak.middleware());
const { clientId, credentials, realm, serverUrl } = keycloakConfig;
// Function to generate token and user data
export const keycloakAccessToken = async (req, res) => {

    try {
  
      // Client Credentials Flow: Obtain an access token
      const tokenResponse = await axios.post(
        `${serverUrl}/realms/${realm}/protocol/openid-connect/token`,
        new URLSearchParams({
          client_id: clientId,
          client_secret: credentials.clientSecret,
          grant_type: "client_credentials",
        })
      );
  
      // Retrieve the access token from Keycloak
      const keycloakToken = tokenResponse.data.access_token;
      console.log("keycloakToken ======>>>>", keycloakToken)
      return keycloakToken;
      
    } catch (error) {
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  };