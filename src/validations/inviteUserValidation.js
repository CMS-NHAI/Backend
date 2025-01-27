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
  office: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      office_name: Joi.string().required(),
      office_address: Joi.string().required(),
      phone_number: Joi.string().required(),
      mobile_number: Joi.string().required(),
      office_email: Joi.string().email().required(),
    })
  ).optional(),
  
  // Validation for contracts array
  contracts: Joi.array().items(
    Joi.object({
      contract_id: Joi.string().required(),
      contract_name: Joi.string().required(),
      contract_disc: Joi.string().required(),
    })
  ).optional(),
  roles_permission: Joi.array().items(Joi.string()).allow(null).optional(), 
});
