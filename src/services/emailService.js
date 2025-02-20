import nodemailer from 'nodemailer'
import { config } from 'dotenv';
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

export const sendEmail = (to, subject, text) => {

  const mailOptions = {
    from: process.env.ZOHO_EMAIL,
    to: to,                       
    subject: subject,            
    text: text,
  };

  return transporter.sendMail(mailOptions);
};
