import { Parser } from "xml2js"; // Importing the XML parser

// Function to get the access token from DigiLocker using fetch
const getAccessTokenFromDigiLocker = async (code) => {
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

// Function to parse XML to JSON
const parseXmlToJson = (xml) => {
  return new Promise((resolve, reject) => {
    const xmlParser = new Parser();
    xmlParser.parseString(xml, (err, result) => {
      if (err) {
        reject(new Error("Failed to parse XML"));
      } else {
        resolve(result);
      }
    });
  });
};

// Function to call two other APIs using the access token and return the response
export const digiLockerUserDetail = async (req, res) => {
  try {
    const { code } = req.body;

    // Get the access token
    const accessToken = await getAccessTokenFromDigiLocker(code);

    // Fetch User Details
    const userDetailResponse = await fetch(
      `${process.env.USER_DETAIL_URL}?access_token=${accessToken}`,
      {
        method: "GET",
      }
    );

    if (!userDetailResponse.ok) {
      throw new Error(`Failed to fetch user details: ${userDetailResponse.statusText}`);
    }

    const userDetail = await userDetailResponse.json();

    // Fetch User Aadhaar Image
    const eAdharDetail = await fetch(
      `${process.env.E_ADHAR_URL}?access_token=${accessToken}`,
      {
        method: "GET",
      }
    );

    if (!eAdharDetail.ok) {
      throw new Error(`Failed to fetch Aadhaar image: ${eAdharDetail.statusText}`);
    }

    const eAdharXml = await eAdharDetail.text(); // Get the XML response text
    const eAdharJson = await parseXmlToJson(eAdharXml); // Parse XML to JSON

    // Return a structured response
    return res.status(200).json({
      status: "success",
      message: "User details retrieved successfully.",
      data: {
        userDetail: userDetail,
        eAdharDetail: eAdharJson, // Send the parsed JSON
      },
    });

  } catch (error) {
    console.error("Error calling APIs:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
