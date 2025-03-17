// controllers/otpController.js
import prisma from "../config/prismaClient.js";
import sendOTP from "../services/twilioService.js"
import generateOTP from "../utils/otpGenerator.js";
import validatePhoneNumber from "../utils/validation.js";
import { otpSchema, phoneValidationSchema } from "../validations/otpValidation.js";
import { otpmobileValidationSchema } from "../validations/otpMobileValidation.js";
import { OTP_CONSTANT, SEND_RESEND_OTP_CONSTANT } from '../constants/constant.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import bcrypt from "bcryptjs";
import { STATUS_CODES } from "../constants/statusCodesConstant.js";
import { sendEmail } from '../services/emailService.js';
import { sendOtpSMS } from "../services/cdacOtpService.js";

const uniqueUsername = uuidv4();

async function hashOTP(otp) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(otp.toString(), salt);
}

async function verifyOTP(otp, hashedOTP) {
  return await bcrypt.compare(otp.toString(), hashedOTP);
}

export const authenticateOtp = async (req, res) => {
  try {
    // Validate the request body using Joi
    const { error } = otpmobileValidationSchema.validate(req.body);
    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: error.details[0].message });
    }

    const { mobile_no, email, otp, ord_id, purpose } = req.body;
    if (!mobile_no && !email) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        status: 400,
        message: 'email or phone_number is required '
      });
    }

    const validOtp = '12345';
    if (otp !== validOtp) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        status: 400,
        message: 'Invalid OTP.'
      });
    }

    // Simulate fetching user details after OTP verification
    // const userDetails = {
    //   name: 'Amit Chaman',
    //   role: ['admin', 'manager'], // Example roles; replace with actual role logic
    // };
    // const user = await prisma.user_master.findUnique({
    //   where: {
    //     OR: [
    //       { mobile_no: mobile_no },
    //       { email: email }
    //     ]
    //   }
    // });
    const user = await prisma.user_master.findUnique({
      where: {
        mobile_number: mobile_no,
      }
    });

    // If user not found, return an error response
    if (!user) {
      return res.status(STATUS_CODES.ACCEPTED).json({
        success: false,
        status: 200,
        message: 'User not found.'
      });
    }

    // Respond with verified status and user details
    return res.status(STATUS_CODES.ACCEPTED).json({
      success: true,
      status: 200,
      verified: 'yes',
      user_details: user,
    });
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(error.message);
  }
}

export const sendOtpToUserLatest = async (req, res) => {

  const { mobile_number, email, otp_verification_method } = req.body;
  const { error } = otpSchema.validate({ mobile_number, email, otp_verification_method });
  if (error) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      status: STATUS_CODES.BAD_REQUEST,
      message: error.details[0].message || 'Invalid phone number.',
    });
  }

  const user = await prisma.user_master.findUnique({
    where: { mobile_number: mobile_number },
    select: {
      user_id: true,
    }
  });

  if (!user) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      status: STATUS_CODES.BAD_REQUEST,
      message: 'Invalid phone number.',
    });
  }

  try {
    const recentOtps = await prisma.otp_verification.count({
      where: {
        user_id: user?.user_id,
        otp_sent_timestamp: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Last 24 hours 24 * 60 * 60 *1000
        },
        is_deleted: false,
      },
    });

    if (recentOtps >= OTP_CONSTANT.MAX_OTP_LIMIT) {
      return res.status(STATUS_CODES.TOO_MANY_REQUESTS).json({
        success: false,
        status: STATUS_CODES.TOO_MANY_REQUESTS,
        message: "Max OTP limit reached."
      });
    }
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    let phoneNumber = mobile_number;
    if (phoneNumber.startsWith("+91")) {
      phoneNumber = phoneNumber.substring(3); 
    }
   // const smsinfo = await sendOtpSMS(phoneNumber)
    const hashed = await hashOTP(12345)//(smsinfo.genOtp);
    
    await prisma.otp_verification.create({
      data: {
        otp_id: crypto.randomUUID(),
        user_id: user.user_id,
        otp_sent_timestamp: new Date(),
        otp_verification_status: "PENDING",
        otp_expiration: expirationTime,
        otp_verification_method: 'SMS',
        otp_hash: hashed
      },
    });

    res.json({
      success: true,
      status: 200,
      message: "OTP sent successfully."
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: "Something went wrong! Please try again."
    });
  }
}



export const sendOtpToUserViaEmailLatest = async (req, res) => {

  const { email } = req.body;
  const generateOtp = () => crypto.randomInt(10000, 99999).toString();

  if (!email) {
    return res.status(400).json({
      success: true,
      status: 200,
      message: 'Email is required'
    });
  }

  // Generate a 6-digit OTP
  const otp = crypto.randomInt(10000, 99999).toString();

  // Store OTP with an expiration time (5 minutes)

  const subject = 'OTP for Login and Registration: DATALAKE 3.0';
  const text = `Your requested OTP is ${otp}`;

  sendEmail(email, subject, text)
    .then(info => {
      console.log('Email sent: ' + info.response);
      res.status(200).json({
        success: true,
        status: 200,
        message: 'OTP sent successfully'
      });

    })
    .catch(error => {
      console.log(error);
      res.status(500).send('Error sending email');
    });
}



