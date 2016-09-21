var Joi = require('joi');

module.exports = {
  payload: {
    first_name: Joi.string().min(1).required(),
    last_name: Joi.string().min(1).required(),
    job_title: Joi.any().optional(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(0).max(15),
    organisation_id: Joi.number().min(-1).required(),
    user_type: Joi.string().valid('admin', 'primary')
  }
};
