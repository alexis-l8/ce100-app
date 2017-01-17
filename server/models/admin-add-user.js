var Joi = require('joi');

module.exports = {
  payload: {
    first_name: Joi.string().min(1).required(),
    last_name: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    org_id: Joi.number().min(-1),
    job_title: Joi.string().allow(''),
    phone: Joi.string().regex(/[0-9]+/).min(11).allow(''),
    user_type: Joi.string().valid('admin', 'primary', 'secondary')
  },
  failAction: require('../handlers/people/add-view.js')
};
