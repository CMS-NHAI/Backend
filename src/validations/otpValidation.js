import Joi from "joi";


export const phoneValidationSchema = Joi.object({
    otp_verification_method: Joi.string().valid('SMS', 'Email').required(),
    mobile_number: Joi.string()
      .pattern(/^\+91\d{10}$/) // Validates India mobile number format (+91 followed by exactly 10 digits)
      .required()
      .messages({
        'string.empty': 'Mobile number is required.',
        'string.pattern.base': 'Mobile number must be in the format +91 followed by exactly 10 digits.',
        'any.required': 'Mobile number is required.'
      })
  });

 
  export const otpSchema = Joi.object({
    mobile_number: Joi.string()
      .pattern(/^\+91\d{10}$/, { name: 'Indian mobile number format' })
      .messages({
        'string.pattern.name': 'Mobile number must be in the format +91XXXXXXXXXX.',
      }),
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .messages({
        'string.email': 'Please enter a valid email address.',
      }),
    otp_verification_method: Joi.string()
      .valid('SMS', 'Email')
      .required()
      .messages({
        'any.only': 'OTP verification method must be either "SMS" or "Email".',
        'any.required': 'OTP verification method is required.',
      }),
  })
    .or('mobile_number', 'email') // Ensures at least one of the fields is present
    .messages({
      'object.missing': 'At least one of mobile number or email must be provided.',
    });