var Joi = require('joi');

module.exports = {
  payload: {
    password: Joi.string().min(1).required(),
    confirmPassword: Joi.string().min(1).required()
    // TODO: make min 6 & password match confirmPassword
  }
};
