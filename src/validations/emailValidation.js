import { RESPONSE_MESSAGES } from "../constants/responseMessages.js";
export const emailValdation = (email, subject, text) => {
    if (!email) {
      return RESPONSE_MESSAGES.ERROR.EMAIL_NOT_FOUND
    }
    if (!subject) {
      return RESPONSE_MESSAGES.ERROR.SUBJECT_NOT_FOUND
    }
    if (!text) {
      return RESPONSE_MESSAGES.ERROR.EMAIL_TEXT_NOT_FOUND
    }
    return null;
  };