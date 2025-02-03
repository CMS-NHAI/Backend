import nodemailer from 'nodemailer'

// Create a transporter using Gmail's SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'testnhai06@gmail.com', // Your Gmail address
    pass: 'osgf xszp qxkn zzdn',    // Your Gmail app password
  },
});

export const sendEmail = (to, subject, text) => {

  const mailOptions = {
    from: 'testnhai06@gmail.com', // Sender email
    to: to,                       // Add recipient email
    subject: subject,             // Add Mail Subject
    text: text,                   // add text
  };

  return transporter.sendMail(mailOptions);
};

