import axios from 'axios';

export async function sendOtpSMS(username, password, content, mobileno, senderid, key, smsservicetype, templateid) {

    let responseString = '';

    try {

        const data = {
            username: username,
            password: password,
            content:`OTP for Login to NHAI is ${content}. Digital India Corporation`,
            mobileno: mobileno,
            senderid: senderid,
            key:key,
            smsservicetype: smsservicetype,
            templateid: templateid,
        };

        const response = await axios.post('https://msdgweb.mgov.gov.in/esms/sendsmsrequestDLT', data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
      
        responseString = response.data;

         const msgContent = responseString.split(',')
         if (msgContent[0] == "402") {
            return {
                status: Number(msgContent[0]),
                message: "Messages send successfully"
            };
        }
       
        return responseString
    } catch (error) {
        console.error('Error sending OTP SMS:', error);
        responseString = error.message || 'An error occurred';
    }
   
}
