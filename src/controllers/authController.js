import { getAccessTokenFromDigiLocker } from "../helper/getAccessTokenFromDigiLocker.js";
import { parseXmlToJson } from "../helper/parseXmlToJson.js";
// import prisma  from "../config/prismaClient.js";

/**
 *
 * Method use to get the user details from digilocker
 * Method @post
 * required params @code
 * 
 */
export const digiLockerUserDetail = async (req, res) => {
  try {
    const { code } = req.body;

    // Get the access token to access other api
    const accessToken = await getAccessTokenFromDigiLocker(code);

    // Fetch User Details from degiLocker
    const userDetailResponse = await fetch(
      `${process.env.USER_DETAIL_URL}?access_token=${accessToken}`,
      {
        method: "GET",
      }
    );

    if (!userDetailResponse.ok) {
      throw new Error(
        `Failed to fetch user details: ${userDetailResponse.statusText}`
      );
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
      throw new Error(
        `Failed to fetch Aadhaar image: ${eAdharDetail.statusText}`
      );
    }

    const eAdharXml = await eAdharDetail.text(); // Get the XML response text
    const eAdharJson = await parseXmlToJson(eAdharXml); // Parse XML to JSON

    // Add digilocker detail into database start (address field is missing)
    //   const data = await prisma.user_master.update({
    //     where: { id: "1" },
    //     data: { mobile_number: "", gender:"", date_of_birth:"", is_digilocker_verified:true},
    // })
    // Add digilocker detail into database end

    return res.status(200).json({
      success: true,
      status: 200,
      msg: "User details from digilocker retrieved successfully.",
      data: {
        userDetail: userDetail,
        eAdharDetail: eAdharJson, // Send the parsed JSON
      },
    });
  } catch (error) {
    console.error("Error calling APIs:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: error.message,
    });
  }
};
