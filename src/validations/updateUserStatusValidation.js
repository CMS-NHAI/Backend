import Joi from 'joi';

export const updateUserStatusValidationSchema = Joi.object({
  user_id: Joi.required(),
  status: Joi.string().valid('active', 'inactive').required(),
});
