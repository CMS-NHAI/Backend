import { STATUS_CODES } from "../constants/statusCodesConstant.js";
import { RESPONSE_MESSAGES } from "../constants/responseMessages.js";
import { sendEmail } from "../services/emailService.js";
import { emailValdation } from "../validations/emailValidation.js";

export const sendEmailViaZoho = async (req, res) => {

  const { email, subject, text } = req.body;

  const validationError = emailValdation(email, subject, text);
  if (validationError) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      status: STATUS_CODES.BAD_REQUEST,
      message: validationError,
    });
  }

  try {
  
    const emailResponse = await sendEmail(email, subject, text);
 
    if (emailResponse.success) {
      return res.status(STATUS_CODES.OK).json({
        success: RESPONSE_MESSAGES.SUCCESS.status,
        status: STATUS_CODES.OK,
        message: RESPONSE_MESSAGES.SUCCESS.EMAIL_SEND
      });
    } else {
    
      return res.status(emailResponse.responseCode).json({
        success: RESPONSE_MESSAGES.ERROR.Fail,
        status: emailResponse.responseCode,
        message: emailResponse.message, 
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: RESPONSE_MESSAGES.ERROR.Fail,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: RESPONSE_MESSAGES.ERROR.EMAIL_FAIL,
    });
  }
};
