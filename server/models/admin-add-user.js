var Joi = require('joi');

module.exports = {
  payload: {
    first_name: Joi.string().min(1).required(),
    last_name: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    organisation_id: Joi.number().min(-1).required(),
    phone: Joi.string().regex(/[0-9]+/).min(11),
    user_type: Joi.string().valid('admin', 'primary')
  },
  failAction: require('../handlers/people/add-view.jså')
};
