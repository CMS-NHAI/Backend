import axios from 'axios';
import crypto from 'crypto';
import qs from 'querystring';

function hashGenerator(username, senderid, message, secureKey) {
    return crypto.createHash('sha256').update(username + senderid + message + secureKey).digest('hex');
}

export async function sendOtpSMS(username, password,  message, senderid, mobileNumber, secureKey, messages, hashValue, smsservicetype, templateid) {

    let responseString = '';

    try {

        const encryptedPassword = crypto.createHash('md5').update(password).digest('hex');
    
        message = message.trim();

        const generatedHashKey = hashGenerator(username, senderid, message, secureKey);

        const data = {
            mobileno: mobileNumber,
            senderid: senderid,
            content: message,
            smsservicetype: smsservicetype,
            username: username,
            password: encryptedPassword,
            key: generatedHashKey,
            templateid: templateid,
        };

        const response = await axios.post('https://msdgweb.mgov.gov.in/esms/sendsmsrequestDLT', qs.stringify(data), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
       
        responseString = response.data;

    } catch (error) {
        console.error('Error sending OTP SMS:', error);
        responseString = error.message || 'An error occurred';
    }

    return responseString;
}
