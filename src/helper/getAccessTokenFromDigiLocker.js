// Method use to generate access token.
export const getAccessTokenFromDigiLocker = async (code) => {
  
  if (!code) {
    throw new Error("Code not found. Please send the code.");
  }

  try {
    const response = await fetch(process.env.ACCESS_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: process.env.GRANT_TYPE,
        code: code, // Use the code provided as argument
        redirect_uri: process.env.REDIRECT_URI,
        code_verifier: process.env.CODE_VERIFIER,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch access token: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.access_token; // Return the access token
  } catch (error) {
    throw new Error(`Failed to get access token: ${error.message}`);
  }
};


export const getAccessTokenFromDigiLockerMobile = async (code) => {
  
  if (!code) {
    throw new Error("Code not found. Please send the code.");
  }

  try {
    const response = await fetch(process.env.ACCESS_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: process.env.GRANT_TYPE,
        code: code, // Use the code provided as argument
        redirect_uri: process.env.REDIRECT_URI_MOBILE,
        code_verifier: process.env.CODE_VERIFIER_MOBILE,
        client_id: process.env.CLIENT_ID_MOBILE,
        client_secret: process.env.CLIENT_SECRET_MOBILE,
      }),    
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch access token: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.access_token; // Return the access token
  } catch (error) {
    throw new Error(`Failed to get access token: ${error.message}`);
  }
};