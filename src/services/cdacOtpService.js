import axios from 'axios';
import crypto from 'crypto';
import { generateFiveDigitRandomNumber } from './randomNumberService.js';

/**
 * Description : @hashGenerator method generate hash.
 * Params @username @senderId @content @secureKey  - Pass the mobile where the otp will be sent. 
*/

function hashGenerator(username, senderId, content, secureKey) {

    const finalString = username?.trim() + senderId?.trim() + content?.trim() + secureKey?.trim();
    const hash = crypto.createHash('sha512');
    hash.update(finalString);
    return hash.digest('hex');
}

/**
 * Description : @sendOtpSMS method use to send 5 digit random otp to the provided mobile number.
 * Method @POST
 * Params @mobileno - Pass the mobile where the otp will be sent. 
*/

export const sendOtpSMS = async (mobileno) => {

    let responseString = '';
    try {
        const otp = generateFiveDigitRandomNumber()
        let content = `OTP for Login to NHAI is ${otp}. Digital India Corporation`
        const generatedHashKey = hashGenerator(process.env.CDAC_SMS_USERNAME, process.env.CDAC_SMS_SENDERID, content, process.env.CDAC_SMS_SECURE_KEY);
        const data = {
            username: process.env.CDAC_SMS_USERNAME,
            password: process.env.CDAC_SMS_PASSWORD,
            content: content,
            mobileno: mobileno,
            senderid: process.env.CDAC_SMS_SENDERID,
            key: generatedHashKey,
            smsservicetype: process.env.CDAC_SMS_SERVICE_TYPE,
            templateid: process.env.CDAC_SMS_TEMPLATEID,
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
                message: "Messages send successfully",
                genOtp: otp
                
            };
        }
         // const result = responseString.concat(" ", otp);
        return responseString
    } catch (error) {
        console.error('Error sending OTP SMS:', error);
        responseString = error.message || 'An error occurred';
        return responseString
    }

}

/**
 * Description : @sendOtpSMSForInvite method use to send invitation link on the given mobile number.
 * Params @mobileno & @invitationLink - Pass the mobile where the invitation link will be sent. 
*/
export const sendOtpSMSForInvite = async (mobileno, invitation_link) => {

    let responseString = '';
    try {
        let content = `Dear Sir/Ma'am, You have been invited to join Datalake 3.0. Please click the link https://nhaistaging.dic.org.in/${invitation_link}
Thanks & Regards, NHAI Group`

        const generatedHashKey = hashGenerator(process.env.CDAC_SMS_USERNAME, process.env.CDAC_SMS_SENDERID, content, process.env.CDAC_SMS_SECURE_KEY);
        
        const data = {
            username: process.env.CDAC_SMS_USERNAME,
            password: process.env.CDAC_SMS_PASSWORD,
            content: content,
            mobileno: mobileno,
            senderid: process.env.CDAC_SMS_SENDERID,
            key: generatedHashKey,
            smsservicetype: process.env.CDAC_SMS_SERVICE_TYPE,
            templateid: process.env.CDAC_SMS_TEMPLATEID_For_INVITATION_LINK,
        };

        const response = await axios.post('https://msdgweb.mgov.gov.in/esms/sendsmsrequestDLT', data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        console.log("response")

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
        return responseString
    }

}
