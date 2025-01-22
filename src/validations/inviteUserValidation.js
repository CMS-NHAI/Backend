import Joi from 'joi';

export const inviteUserValidationSchema = Joi.object({
  name: Joi.string().required(), 
  email: Joi.string().email().required(), 
   mobile_number: Joi.string()
      .pattern(/^\+91\d{10}$/) // Validates India mobile number format (+91 followed by exactly 10 digits)
      .required()
      .messages({
        'string.empty': 'mobile_number is required.', // Custom message for missing mobile number
        'string.pattern.base': 'Mobile number must be in the format +91 followed by exactly 10 digits.',
        'any.required': 'mobile_number is required.', // Custom message for missing mobile number
      }),
  office_mobile_number: Joi.string()
     .pattern(/^\+91\d{10}$/) // Validates India mobile number format (+91 followed by exactly 10 digits)
     .required()
     .messages({
       'string.empty': 'office_mobile_number is required.', // Custom message for missing mobile number
       'string.pattern.base': 'Mobile number must be in the format +91 followed by exactly 10 digits.',
       'any.required': 'office_mobile_number is required.', // Custom message for missing mobile number
     }), 
  designation: Joi.string().valid('CGM', 'DGM', 'GM', 'Manager').required(), 
  user_type: Joi.string().valid('Internal - Permanent', 'Internal - Contractual', 'External').required(), 
  status: Joi.string().valid('Active', 'Inactive', 'Blocked').required(),
  office: Joi.string().optional().allow('').messages({
    'string.empty': 'office can be an empty string.', // Optional message for empty string
  }), 
  
  contracts: Joi.string().optional().allow('').messages({
    'string.empty': 'contracts can be an empty string.', // Optional message for empty string
  }),  
  
  roles_permission: Joi.array().optional().allow('').messages({
    'string.empty': 'roles_permission can be an empty string.',
  })
});
