import { getAccessTokenFromDigiLocker } from "../helper/getAccessTokenFromDigiLocker.js";
import { parseXmlToJson } from "../helper/parseXmlToJson.js";
import prisma  from "../config/prismaClient.js";
import jwt from "jsonwebtoken";

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

    // Get the the user email from the access token
  // Extract user ID and email from the token payload
  const userEmail = req.user.email;  
    // Add digilocker detail into database start (address field is missing)
    const userInfo = {
      email : userEmail,
      userDetail: userDetail,
      eAdharDetail: eAdharJson,
    }

    const updatedUser = await prisma.user_master.update({
      where: { email: userEmail },
      data: {
        user_data: userInfo, // Adjust the field name based on your schema
      },
    });

    //   const data = await prisma.user_master.update({
    //     where: { email: userEmail },
    //     user_data: userInfo,
    // })
    // Add digilocker detail into database end

    return res.status(200).json({
      success: true,
      status: 200,
      msg: "User details from digilocker retrieved successfully.",
      data: userInfo
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

export const digiLockerFinalRegistration = async(req, res)=>{

  try{
    const authorizationHeader =
    req.headers.Authorization || req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(400).json({ msg: "Authorization header is missing" });
  }

  const token = authorizationHeader.split(" ")[1];

  if (!token) {
    return res.status(400).json({ msg: "Token is missing or invalid" });
  }

  // Decode the token (without verifying) to get the payload
  const userEmail = req.user.email;  
  // Extract user ID and email from the token payload
  // const data = await prisma.user_master.update({
  //       where: { email: userEmail },
  //       is_digilocker_verified: true,
  //   })

    const data = await prisma.user_master.update({
      where: { email: userEmail },
      data: {
        is_digilocker_verified: true,
      },
    });

    res.status(200).json({
      success: true,
      msg: "User verified successfully.",
    });

  }catch(error){

    res.status().json({ success:false, msg:error.message})

  }

}
