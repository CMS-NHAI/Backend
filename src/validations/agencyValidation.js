import Joi from 'joi';

export const organizationSchema = Joi.object({
    name: Joi.string().max(255).required(),
    org_type: Joi.string().max(50).required(),
    contractor_agency_type: Joi.string().max(50).optional(),
    date_of_incorporation: Joi.date().optional(),
    selection_method: Joi.string().max(50).optional(),
    empanelment_start_date: Joi.date().optional(),
    empanelment_end_date: Joi.date().optional(),
    organization_data: Joi.object().optional(),
    spoc_details: Joi.object().optional(),
    tin: Joi.string().max(20).optional(),
    contact_number: Joi.string().max(20).optional(),
    gst_number: Joi.string().max(20).optional(),
    pan: Joi.string().max(20).optional(),
    contact_email: Joi.string().email().max(255).optional(),
    invite_status: Joi.string().valid('PENDING', 'ACCEPTED', 'REJECTED').default('PENDING'),
    is_active: Joi.boolean().default(true),
    created_by: Joi.number().optional(),
    last_updated_by: Joi.number().optional(),
    status: Joi.string().optional(),
  });


  export default organizationSchema;