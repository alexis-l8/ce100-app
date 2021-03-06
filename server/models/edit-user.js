var Joi = require('joi');

var editView = require('../handlers/people/edit-view.js');

module.exports = {
  payload: (value, options, next) => {
    var scope = options.context.auth.credentials.scope;

    return Joi.validate(value, schema[scope], next);
  },
  failAction: editView
};

var non_admin = {
  first_name: Joi.string().min(1).required(),
  last_name: Joi.string().min(1).required(),
  job_title: Joi.string().allow(''),
  phone: Joi.string().regex(/[0-9]+/).min(11).allow(''),
  file_name: Joi.any().optional(),
  logo: Joi.any().optional()
}

var schema = {
  admin: {
    first_name: Joi.string().min(1).required(),
    last_name: Joi.string().min(1).required(),
    job_title: Joi.string().allow(''),
    email: Joi.string().email().required(),
    phone: Joi.string().regex(/[0-9]+/).min(11).allow(''),
    org_id: Joi.number().min(-1).required(),
    user_type: Joi.string().valid('admin', 'content-owner', 'primary', 'secondary').required(),
    file_name: Joi.any().optional(),
    logo: Joi.any().optional()
  },
  primary: non_admin,
  secondary: non_admin
};

schema['content-owner'] = schema.admin;
