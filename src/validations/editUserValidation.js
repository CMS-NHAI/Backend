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
