import { getAccessTokenFromDigiLocker, getAccessTokenFromDigiLockerMobile} from "../helper/getAccessTokenFromDigiLocker.js";
//import { getAccessTokenFromDigiLockerMobile } from "../helper/getAccessTokenFromDigiLocker.js";
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

export const digiLockerFinalRegistrationMobile = async(req, res)=>{

  try{
  //   const authorizationHeader =
  //   req.headers.Authorization || req.headers.authorization;

  // if (!authorizationHeader) {
  //   return res.status(400).json({ msg: "Authorization header is missing" });
  // }

  // const token = authorizationHeader.split(" ")[1];

  // if (!token) {
  //   return res.status(400).json({ msg: "Token is missing or invalid" });
  // }

  // Decode the token (without verifying) to get the payload
  //const userEmail = req.user.email;  
  const userEmail = "bhawesh_bhanu@cms.co.in"	
  // Extract user ID and email from the token payload
  // const data = await prisma.user_master.update({
  //       where: { email: userEmail },
  //       is_digilocker_verified: true,
  //   })


  // =======================================================================
  const vectorImage = `"[-0.08620621263980865, 0.06283238530158997, 0.051346778869628906, -0.10136576741933823, -0.07207173109054565, 0.011964146047830582, -0.06247447058558464, -0.1001443937420845, 0.24618791043758392, -0.20260846614837646, 0.20369446277618408, -0.005090087652206421, -0.1972719132900238, -0.10372335463762283, 0.00021890923380851746, 0.1786089688539505, -0.10588350892066956, -0.21853400766849518, -0.09034336358308792, -0.03594448044896126, -0.05304189771413803, -0.07648685574531555, 0.05427156016230583, 0.08001867681741714, -0.10168527066707611, -0.44653841853141785, -0.05538544803857803, -0.12161033600568771, 0.005868374370038509, -0.07130593806505203, -0.0919775441288948, 0.13245166838169098, -0.1986694633960724, -0.058984726667404175, -0.011944174766540527, 0.1231352686882019, -0.022386759519577026, -0.012326259166002274, 0.19283398985862732, -0.023612141609191895, -0.28329819440841675, -0.031143702566623688, 0.06657260656356812, 0.22024919092655182, 0.20580866932868958, 0.027327558025717735, 0.024837786331772804, -0.04486962407827377, 0.10639970004558563, -0.26016172766685486, 0.053526297211647034, 0.10908609628677368, 0.10639305412769318, 0.01479281671345234, 0.11980459094047546, -0.15152214467525482, -0.018731819465756416, 0.07029779255390167, -0.14778947830200195, -0.0037043436896055937, -0.03252043575048447, -0.0577220544219017, -0.076022207736969, -0.0874701663851738, 0.3124232590198517, 0.17494900524616241, -0.12142957746982574, -0.063756562769413, 0.23327410221099854, -0.13400407135486603, 0.00763976713642478, 0.04101279005408287, -0.10963208228349686, -0.16508807241916656, -0.23782770335674286, -0.010027717798948288, 0.3950083255767822, 0.15941955149173737, -0.16093723475933075, 0.09533339738845825, -0.09605415165424347, -0.06908831000328064, -0.025714674964547157, 0.1214929074048996, -0.09928897768259048, 0.09394630044698715, -0.001320917159318924, 0.018919367343187332, 0.1813289374113083, 0.027219202369451523, 0.019601861014962196, 0.20876118540763855, -0.03515322506427765, 0.07062716782093048, 0.03249514475464821, 0.0015843916917219758, -0.09479910135269165, -0.04871963709592819, -0.2430812418460846, -0.07382342219352722, -0.00477979052811861, -0.039697907865047455, -0.009559676051139832, 0.0763351172208786, -0.23094874620437622, 0.09360170364379883, 0.0035903791431337595, -0.009360618889331818, 0.054426416754722595, 0.1162935197353363, -0.028860177844762802, -0.11430879682302475, 0.11468036472797394, -0.2412043809890747, 0.13411223888397217, 0.1739211231470108, 0.05484960228204727, 0.1586732268333435, 0.11593693494796753, 0.03635922074317932, 0.047139137983322144, -0.06398922950029373, -0.17767980694770813, -0.04713642597198486, 0.10583813488483429, -0.0685267448425293, 0.04937364161014557, 0.05825193226337433]"`
 
  console.log("vectorImage =====>>>>>>", vectorImage)
 
  // =======================================================================

    const data = await prisma.user_master.update({
      where: { email: userEmail },
      data: {
        is_digilocker_verified: true,
        user_vector_image: vectorImage
      },
    });

    res.status(200).json({
      success: true,
      msg: "User verified successfully.",
    });

  }catch(error){

    res.status(500).json({ success:false, msg:error.message})

  }

};
