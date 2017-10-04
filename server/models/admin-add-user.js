var Joi = require('joi');

module.exports = {
  payload: {
    first_name: Joi.string().min(1).required(),
    last_name: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    org_id: Joi.any().when('user_type', {
      is: Joi.string().valid('admin', 'content-owner'),
      then: Joi.number().valid(-1).required().options({ language: { any: { allowOnly: 'Admins cannot be attached to an organisation' } } }),
      otherwise: Joi.number().min(1).required()
    }),
    job_title: Joi.string().allow(''),
    phone: Joi.string().regex(/[0-9]+/).min(11).allow(''),
    user_type: Joi.string().valid('admin', 'content-owner', 'primary', 'secondary'),
    file_name: Joi.any().optional(),
    logo: Joi.any().optional()
  },
  failAction: require('../handlers/people/add-view.js')
};
