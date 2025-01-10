import Joi from 'joi';

export const sapValidationSchema = Joi.object({
  sap_id: Joi.string()
    .required()
    .messages({
      'string.empty': 'SAP ID is required.',
      'any.required': 'SAP ID is required.',
    }),
});
