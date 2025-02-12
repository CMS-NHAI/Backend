import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: 'kumar_mukul@zohomail.in',
    pass: 'eJq7tSfMNw23',
  }
});
export const sendEmail = (to, subject, text) => {

  const mailOptions = {
    from: 'kumar_mukul@zohomail.in',
    to: to,                       
    subject: subject,            
    text: text,
  };

  return transporter.sendMail(mailOptions);
};
