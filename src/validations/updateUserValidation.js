import Joi from 'joi';
export const updateUserValidationSchema = Joi.object({
  user_id: Joi.number().required(),
  sap_id: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  mobile_number: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(), // Regex for international mobile numbers
  user_type: Joi.string().required(),
  designation: Joi.string().required()
});
