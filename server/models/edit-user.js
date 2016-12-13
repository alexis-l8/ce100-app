var Joi = require('joi');

var editView = require('../handlers/people/edit-view.js');

module.exports = {
  payload: (value, options, next) => {
    var scope = options.context.auth.credentials.scope;
    return Joi.validate(value, schema[scope], next);
  },
  failAction: editView
};

var schema = {
  admin: {
    first_name: Joi.string().min(1).required(),
    last_name: Joi.string().min(1).required(),
    job_title: Joi.any().optional(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(8).max(13),
    org_id: Joi.number().min(-1).required(),
    user_type: Joi.string().valid('admin', 'primary').required()
  },
  primary: {
    first_name: Joi.string().min(1).required(),
    last_name: Joi.string().min(1).required(),
    job_title: Joi.any().optional(),
    phone: Joi.string().min(8).max(13)
  }
};
