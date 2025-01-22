import Joi from 'joi';

export const editUserValidationSchema = Joi.object({
  user_id: Joi.number().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  mobile_number: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/) // Regex for international mobile numbers
    .required(),
  office_mobile_number: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/) // Regex for international mobile numbers
    .required(),
  user_type: Joi.string().valid('Internal - Permanent', 'Internal - Contractual', 'External').required(),
  designation: Joi.string().required(),
  status: Joi.string().valid('Active', 'Inactive', 'Blocked').required(),
  office: Joi.array().items(Joi.string()).allow(null).optional(),  
  contracts: Joi.array().items(Joi.string()).allow(null).optional(),  
  roles_permission: Joi.array().items(Joi.string()).allow(null).optional(),  
});
