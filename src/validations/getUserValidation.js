import Joi from "joi";

export const userIdValidation = Joi.object({
  user_id: Joi
    .required()
    .messages({
      'any.required': 'user_id is required.',
    }),  
});
