// services/twilioService.js
import twilio from 'twilio';
//const twilio = require('twilio');
import { config } from 'dotenv';
config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOTP = async (serviceSid, phoneNumber, otp) => {
  try {
    // await client.verify.v2.services(serviceSid)
    //   .verifications
    //   .create({
    //     to: phoneNumber,
    //     channel: 'sms',
    //     customMessage: `Your OTP is: ${otp}`,
    //   });
  } catch (err) {
    throw new Error('Error sending OTP via Twilio');
  }
};

export default sendOTP;


