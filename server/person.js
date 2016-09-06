const Joi = require('joi');

const validate = {};

validate.adminAddUser = {
  payload: {
    first_name: Joi.string().min(1).required(),
    last_name: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    organisation_id: Joi.number().min(0).required(),
    user_type: Joi.any().required()
  }
};

validate.adminAddOrganisation = {
  payload: {
    name: Joi.string().min(1).required(),
    // user_type: ['admin']
    submit: Joi.any().optional()
  }
};

validate.confirmPassword = {
  // TODO: check params exist
  payload: {
    password: Joi.string().min(1).required(),
    confirmPassword: Joi.string().min(1).required()
    // TODO: make min 6 & password match confirmPassword
  }
};

validate.login = {
  payload: {
    email: Joi.string().email().required(),
    password: Joi.string().min(1).required(),
    // TODO: make min 6
    failAction: 'error'
  }
};

module.exports = validate;
