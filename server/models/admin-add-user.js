var Joi = require('joi');

module.exports = {
  payload: {
    first_name: Joi.string().min(1).required(),
    last_name: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    organisation_id: Joi.number().min(-1).required(),
    user_type: Joi.string().valid('admin', 'primary')
  }
};
