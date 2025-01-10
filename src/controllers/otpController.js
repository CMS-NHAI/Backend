// controllers/otpController.js
import prisma  from "../config/prismaClient.js";
import sendOTP from "../services/twilioService.js"
import  generateOTP  from "../utils/otpGenerator.js"; 
import  validatePhoneNumber  from "../utils/validation.js";
import { phoneValidationSchema } from "../validations/otpValidation.js";
import { SEND_RESEND_OTP_CONSTANT } from '../constants/constant.js'; 
import { v4 as uuidv4 } from 'uuid';

const uniqueUsername = uuidv4();

export const sendOtpToUser = async (req, res) => {
  const { mobile_number , count } = req.body;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;


  const { error } = phoneValidationSchema.validate({ mobile_number });

  if (error) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: error.details[0].message,
    });
  }
  if(!count || count<0)
  {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "count parameter is missing",
    });
  }
  try {
   
    const user = await prisma.user_master.findUnique({  // Use correct model name
        where: { mobile_number: mobile_number},  // Assuming `mobile_number` is the field to search
      });
    // console.log(user);
    if (!user) {
        
      return res.status(200).json({
        success: false,
        status: 200,
        message: 'User not registered with this phone number.',
      });
      
    }
    
    if (count === 1) {
      const otpTimestamp = new Date(user.otp_timestamp);
      const currentTimestamp = new Date();
      const timeDifference = currentTimestamp - otpTimestamp;
      // Convert time difference from milliseconds to hours
      const timeDifferencesInSeconds = timeDifference / 1000;

      if (timeDifferencesInSeconds < SEND_RESEND_OTP_CONSTANT) {
        return res.status(400).json({
          success: false,
          status: 400,
          message: `Otp resend limit exceeded, please retry after ${SEND_RESEND_OTP_CONSTANT / 60} minutes`,
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
