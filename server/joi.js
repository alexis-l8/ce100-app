const Joi = require('joi');

const validate = {};

validate.adminAddUser = {
  payload: {
    first_name: Joi.string().min(1).required(),
    last_name: Joi.string().min(1).required(),
    email: Joi.string().email().required(),
    organisation_id: Joi.number().min(0).required(),
    user_type: ['primary', 'admin'],
    submit: 'Submit'
  }
};

validate.confirmPassword = {
  payload: {
    password: Joi.string().min(1).required(),
    confirmPassword: Joi.string().min(1).required(),
    // TODO: make min 6 & password match confirmPassword
    submit: 'Submit'
  }
};

module.exports = validate;
