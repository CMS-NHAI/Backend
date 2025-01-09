// controllers/otpController.js
import prisma  from "../config/prismaClient.js";
import sendOTP from "../services/twilioService.js"
import  generateOTP  from "../utils/otpGenerator.js"; 
import  validatePhoneNumber  from "../utils/validation.js";
import { phoneValidationSchema } from "../validations/otpValidation.js";
import { v4 as uuidv4 } from 'uuid';

const uniqueUsername = uuidv4();

export const sendOtpToUser = async (req, res) => {
  const { mobile_number , resend_count } = req.body;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;


  const { error } = phoneValidationSchema.validate({ mobile_number });

  if (error) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: error.details[0].message,
    });
  }
  if(!resend_count)
  {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "resend_count parameter is missing",
    });
  }
  try {
   
    const user = await prisma.user_master.findUnique({  // Use correct model name
        where: { mobile_number: mobile_number},  // Assuming `mobile_number` is the field to search
      });
    console.log(user);
    if (!user) {
        // u = await prisma.user_master.create({
        //     data: {
        //       // unique_username: uuidv4(),
        //       mobile_number: mobile_number,
        //       name: 'Amit',  // Dummy name or leave it blank
        //       first_name: 'Amit',  // First name can also be default
        //       user_type: 'Internal - Permanent',  // A type to indicate the user is not yet registered
        //       user_role: { role: 'UNREGISTERED' },  // You can set a default role
        //       email: 'user1@gmail.com',  // No email for a dummy user
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
        //       sap_id : "SAP12345",
        //       aadhar_image : "HTTP",
        //       user_image : "HEE" // Status indicating the user is pending activation
        //     },
        //   });
        //   console.log(u);
      return res.status(200).json({
        success: false,
        status: 200,
        message: 'User not registered with this phone number.',
      });
      
    }
    
    if (resend_count === 1) {
      const otpTimestamp = new Date(user.otp_timestamp);
      const currentTimestamp = new Date();
      const timeDifference = currentTimestamp - otpTimestamp;

      // Convert time difference from milliseconds to hours
      const timeDifferenceInHours = timeDifference / (1000 * 60 * 60);

      if (timeDifferenceInHours < 2) {
        return res.status(400).json({
          success: false,
          status: 400,
          message: 'Otp resend limit exceeded, please wait for 2 hours',
        });
      }
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
