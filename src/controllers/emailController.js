import { STATUS_CODES } from "../constants/statusCodesConstant.js";
import { RESPONSE_MESSAGES } from "../constants/responseMessages.js";
import { sendEmail } from "../services/emailService.js";
import { emailValdation } from "../validations/emailValidation.js";

export const sendEmailViaZoho = async (req, res) => {
  const { email, subject, text } = req.body;

  // Validate the email, subject, and text
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
      return res.status(emailResponse.responseCode).json({
        success: true,
        status: emailResponse.responseCode,
        message: emailResponse.message
      });
    } else {
      return res.status(emailResponse.responseCode).json({
        success: false,
        status: emailResponse.responseCode,
        message: emailResponse.message, 
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: RESPONSE_MESSAGES.ERROR.EMAIL_FAIL,
    });
  }
};
