import Joi from 'joi';

export const orgIdValidationSchema = Joi.object({
  org_id: Joi.number().required()  
});