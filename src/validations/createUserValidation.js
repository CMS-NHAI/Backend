import Joi from 'joi';

export const createUserValidationSchema = Joi.object({
  organization_id: Joi.any().optional(),
  sap_id: Joi.string().required().messages({
    'string.empty': 'SAP ID is required.',
    'any.required': 'SAP ID is required.',
  }),
  
  name: Joi.string().required().messages({
    'string.empty': 'Name is required.',
    'any.required': 'Name is required.',
  }),

  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required.',
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),

  mobile_number: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required().messages({
    'string.empty': 'Mobile number is required.',
    'string.pattern.base': 'Mobile number must be a valid phone number.',
    'any.required': 'Mobile number is required.',
  }),

  user_type: Joi.string().required().messages({
    'string.empty': 'User type is required.',
    'any.required': 'User type is required.',
  }),

  designation: Joi.string().required().messages({
    'string.empty': 'Designation is required.',
    'any.required': 'Designation is required.',
  }),

  date_of_birth: Joi.date().required().messages({
    'string.empty': 'Date of birth is required.',
    'date.base': 'Date of birth must be a valid date.',
    'date.less': 'Date of birth cannot be a future date.',
    'any.required': 'Date of birth is required.',
  }),
  unique_username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.empty': 'Unique username is required.',
    'any.required': 'Unique username is required.',
  }),
  user_role: Joi.string().required().messages({
    'string.empty': 'User role is required.',
    'any.required': 'User role is required.'
  }),
  aadhar_image: Joi.string()
    .required()
    .messages({
      'string.empty': 'Aadhar image is required.',
      'any.required': 'Aadhar image is required.',
    }),

    user_image: Joi.string()
    .required()
    .messages({
      'string.empty': 'User image is required.',
      'any.required': 'User image is required.',
    })

});
