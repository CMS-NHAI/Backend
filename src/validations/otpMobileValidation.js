import Joi from 'joi';

export const otpmobileValidationSchema = Joi.object({
  mobile_no: Joi.string()
    .pattern(/^\+91\d{10}$/) // Validates India mobile number format (+91 followed by exactly 10 digits)
    .required()
    .messages({
      'string.empty': 'mobile_number is required.', // Custom message for missing mobile number
      'string.pattern.base': 'Mobile number must be in the format +91 followed by exactly 10 digits.',
      'any.required': 'mobile_number is required.', // Custom message for missing mobile number
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'email is required.', // Custom message for missing email
      'string.email': 'Please provide a valid email address.',
      'any.required': 'email is required.', // Custom message for missing email
    }),

  otp: Joi.string()
    .pattern(/^\d{5}$/) // OTP should be exactly 5 digits
    .required()
    .messages({
      'string.empty': 'OTP is required.',
      'string.pattern.base': 'OTP must be a 5-digit number.',
      'any.required': 'OTP is required.',
    }),

  ord_id: Joi.string()
    .required()
    .messages({
      'string.empty': 'Order ID is required.',
      'any.required': 'Order ID is required.',
    }),

  purpose: Joi.string()
    .valid('login', 'signup')
    .required()
    .messages({
      'string.empty': 'Purpose is required.',
      'any.required': 'Purpose is required.',
      'any.only': 'Purpose must be either login or signup.',
    }),
});
