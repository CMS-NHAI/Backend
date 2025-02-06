import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dictestnhai@gmail.com',//'testnhai06@gmail.com',
    pass: 'skag ehel oyjr frrs'  //'osgf xszp qxkn zzdn',
  },
});

export const sendEmail = (to, subject, text) => {

  const mailOptions = {
    from: 'dictestnhai@gmail.com',//'testnhai06@gmail.com', // Sender email
    to: to,                       // Add recipient email
    subject: subject,             // Add Mail Subject
    text: text,                   // add text
  };

  return transporter.sendMail(mailOptions);
};

