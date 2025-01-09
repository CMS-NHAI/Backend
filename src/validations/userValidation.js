import Joi from "joi";

export const otpmobileValidationSchema = Joi.object({
  mobile_number: Joi.string()
    .pattern(/^\+91\d{10}$/) // Validates India mobile number format (+91 followed by exactly 10 digits)
    .required()
    .messages({
      'string.empty': 'Mobile number is required.',
      'string.pattern.base': 'Mobile number must be in the format +91 followed by exactly 10 digits.',
      'any.required': 'Mobile number is required.',
    }),
  
  otp: Joi.string()
    .pattern(/^\d{5}$/) // OTP should be exactly 6 digits
    .required()
    .messages({
      'string.empty': 'OTP is required.',
      'string.pattern.base': 'OTP must be a 5-digit number.',
      'any.required': 'OTP is required.',
    })
});
