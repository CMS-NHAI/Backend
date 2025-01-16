import Joi from 'joi';

export const sapValidationSchema = Joi.object({
  sap_id: Joi.string()
    //.pattern(/^SAP[0-9A-Za-z]{5}$/)
    .required()
    .messages({
      //'string.pattern.base': 'SAP ID must start with "SAP" followed by 5 alphanumeric characters.',
      'string.empty': 'SAP ID is required.',
      'any.required': 'SAP ID is required.',
    }),
});
