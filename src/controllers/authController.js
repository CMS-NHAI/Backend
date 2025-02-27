import { getAccessTokenFromDigiLocker, getAccessTokenFromDigiLockerMobile} from "../helper/getAccessTokenFromDigiLocker.js";
//import { getAccessTokenFromDigiLockerMobile } from "../helper/getAccessTokenFromDigiLocker.js";
import { parseXmlToJson } from "../helper/parseXmlToJson.js";
import prisma  from "../config/prismaClient.js";
import jwt from "jsonwebtoken";
import { STATUS_CODES } from "../constants/statusCodesConstant.js";

/**
 *
 * Method use to get the user details from digilocker
 * Method @post
 * required params @code
 * 
 */

const base64ToVector128 = (base64String) => {
  const buffer = Buffer.from(base64String, 'base64');
  
  if (buffer.length !== 16) {
    res.status(500).json({
      success: true,
      msg: "Invalid input: Base64 must decode to 16 bytes (128 bits)",
    });
      //throw new Error('Invalid input: Base64 must decode to 16 bytes (128 bits)');
  }

  return new Uint8Array(buffer);
};


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

  const employee = await prisma.user_master.findUnique({
    where: {
      email: userEmail, 
    },
    select: {
      user_type: true,
    },
  });
  
  // Extract user ID and email from the token payload
  // const data = await prisma.user_master.update({
  //       where: { email: userEmail },
  //       is_digilocker_verified: true,
  //   })

  if(employee.user_type == 'External'){
    const { base64String } = req.body
    const vectorImage = base64ToVector128(base64String);
    await prisma.user_master.update({
      where: {
        email: userEmail,
      },
      data: {
        is_digilocker_verified: true,
        user_vector_image: vectorImage,
      },
      select: {
        user_id: true,
        unique_username: true,
        email: true,
        user_vector_image: true,
      },
    });
  }else{

    const data = await prisma.user_master.update({
      where: { email: userEmail },
      data: {
        is_digilocker_verified: true,
      },
    });

  }

    res.status(200).json({
      success: true,
      msg: "User verified successfully.",
    });

  }catch (err) {
      console.error(err);
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        status: STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: "Something went wrong! Please try after sometime."
      });
    }

}

export const authenticateEntity = async (req, res) => {
  {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'invalid credentials',
      });
    }

     try {

          const query = {
            code: code,
            grant_type: "authorization_code",
            redirect_uri: "http://localhost:3000/myauth",
            client_id: "RF6AE19E50",
            client_secret: "8d1da0745546e8118507",
            code_verifier: "YglEu2eLv_kB8tbSiKOyZnpKRPCDFgW2uigiAn_D-DkO6-JRcchJx8k7x2x-vXXJG.3"
          }

      const resAccessToken = await fetch('https://entity.digilocker.gov.in/public/oauth2/1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query) // Convert your data to a JSON string
      });

      if (resAccessToken.ok) {
        // Parse the JSON response
        const jsonResponse = await resAccessToken.json();

        // Log the response to inspect the content
        res.status(STATUS_CODES.OK).json({
          success: true,
          message: 'Success',
          // data: employee,
        });
        console.log('JSON Response:', jsonResponse);
      } else {
        // Handle unsuccessful response (non-200 status codes)
        console.log('Error:', resAccessToken.status, resAccessToken.statusText);
        const errorData = await resAccessToken.json();
        console.log('Error details:', errorData);
        res.status(resAccessToken.status).json({
          status: false,
          ...errorData
        });
      }

      
    } catch (err) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message,
      });
    }
  };
}

export const entityLockerFinalRegistration = async(req, res)=>{

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

    const data = await prisma.organization_master.update({
      where: { contact_email: userEmail },
      data: {
        is_entity_locker_verified: true,
      },
    });

    res.status(200).json({
      success: true,
      msg: "Agency/Orgnaigation verified successfully.",
    });

  }catch(error){

    res.status().json({ success:false, msg:error.message})

  }

}

export const  digiLockerCheckUrl = async(req, res)=>{

  res.redirect('https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize?response_type=code&client_id=EMB8D4AF42&state=oidc_flow&redirect_uri=http%3A%2F%2F10.3.0.19%3A3000%2Fmyauth&code_challenge=5ERzTFfnY5nvB8Mv3QrKfr4e1E_PzVyvHiPrK9jP1Rw&code_challenge_method=S256&dl_flow=signin&acr=pan+aadhaar&amr=all&scope=files.issueddocs+files.uploadeddocs+userdetails+email+address+picture')
}


export const digiLockerUserDetailMobile = async (req, res) => {

  try {
    const { code } = req.body;

    // Get the access token to access other api
    const accessToken = await getAccessTokenFromDigiLockerMobile(code);

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
      message: "User details from digilocker retrieved successfully.",
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

export const digiLockerFinalRegistrationMobile = async(req, res)=>{

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
  const { vectorImage } = req.body

  // await prisma.$executeRaw`
  //       UPDATE tenant_nhai."user_master"
  //       SET "is_digilocker_verified" = true,
  //        "user_vector_image" = ${vectorImage}::tenant_nhai.vector(128)
  //       WHERE "email" = ${userEmail}
  //       RETURNING *;
  //   `;

    await prisma.user_master.update({
      where: {
        email: userEmail,
      },
      data: {
        is_digilocker_verified: true,
        user_vector_image: vectorImage,
      },
      select: {
        user_id: true,
        unique_username: true,
        email: true,
        user_vector_image: true,
      },
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: "User verified successfully.",
    });

  }catch(error){

    res.status(500).json({ success:false, message:error.message})

  }

};
