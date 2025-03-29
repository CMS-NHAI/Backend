import nodemailer from 'nodemailer';
import { config } from 'dotenv';
import { RESPONSE_MESSAGES } from '../constants/responseMessages.js';
config();

const transporter = nodemailer.createTransport({
  host: process.env.ZOHO_HOST,
  port: process.env.ZOHO_PORT,
  secure: process.env.ZOHO_SECURE,
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_APP_PASSWORD,
  }
});

export const sendEmail = async (to, subject, text) => {
  try {
   
    const mailOptions = {
      from: process.env.ZOHO_EMAIL,
      to: to,
      subject: subject,
      text: text,
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: info.response,
      info
    };
  } catch (error) {
    if (error.response) {
      return {
        success: RESPONSE_MESSAGES.ERROR.Fail,
        message: `${error.response}`, 
        response: error.response,
        responseCode: error.responseCode,
        error: error.message
      };
    } else {
      return {
        success: false,
        message: `${error.message}`,
        error
      };
    }
  }
};


