var Joi = require('joi');

module.exports = {
  // TODO: check params exist
  payload: {
    password: Joi.string().min(1).required(),
    confirmPassword: Joi.string().min(1).required()
    // TODO: make min 6 & password match confirmPassword
  }
};
