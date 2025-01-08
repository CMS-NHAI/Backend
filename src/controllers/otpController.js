// controllers/otpController.js
import prisma  from "../config/prismaClient.js";
import sendOTP from "../services/twilioService.js"
import  generateOTP  from "../utils/otpGenerator.js"; 
import  validatePhoneNumber  from "../utils/validation.js";
import { v4 as uuidv4 } from 'uuid';

// Generate a UUID as the unique username
const uniqueUsername = uuidv4();

// const prismaClient = new prisma();
//console.log(' prisma client ', prisma);
export const sendOtpToUser = async (req, res) => {
  const { mobile_number } = req.body;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!mobile_number) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Mobile number is required.',
    });
  }

  if (!validatePhoneNumber(mobile_number)) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Mobile number must be in the format +91 followed by exactly 10 digits.',
    });
  }

  try {
    // const user = await prismaClient.user.findUnique({
    //   where: { phone_number },
    // });
    console.log(prisma);
    const user = await prisma.user_master.findUnique({  // Use correct model name
        where: { mobile_number: mobile_number},  // Assuming `mobile_number` is the field to search
      });
    console.log(user);
    if (!user) {
        // u = await prisma.user_master.create({
        //     data: {
        //       // unique_username: uuidv4(),
        //       mobile_number: mobile_number,
        //       name: 'Shailendra',  // Dummy name or leave it blank
        //       first_name: 'Shailendra',  // First name can also be default
        //       user_type: 'Internal - Permanent',  // A type to indicate the user is not yet registered
        //       user_role: { role: 'UNREGISTERED' },  // You can set a default role
        //       email: 'amit@gmail.com',  // No email for a dummy user
        //       is_active: false,  // Set to false for unregistered users
        //       is_kyc_verified: false,  // Assuming KYC is not verified for dummy users
        //       otp: generateOTP(),  // Generate OTP
        //       otp_timestamp: new Date(),
        //       created_at: new Date(),
        //       updated_at: new Date(),
        //       // Optional: You can fill in additional fields if needed (e.g., `activation_status`)
        //       activation_status: 'Pending', 
        //       organization_id: 1,
        //       unique_username : uniqueUsername,
        //       sap_id : "SAP1234",
        //       aadhar_image : "HTTP",
        //       user_image : "HEE" // Status indicating the user is pending activation
        //     },
        //   });
      return res.status(200).json({
        success: false,
        status: 200,
        message: 'User not registered with this phone number.',
      });
      
    }

    const otp = generateOTP();
    const otp_timestamp = new Date();

    await prisma.user_master.update({
      where: { mobile_number },
      data: { otp, otp_timestamp },
    });

    await sendOTP(serviceSid, mobile_number, otp);

    res.status(200).json({
      success: true,
      status: 200,
      message: 'OTP sent successfully.',
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      status: 500,
      message: err,
    });
  }
};

 export default sendOtpToUser;
