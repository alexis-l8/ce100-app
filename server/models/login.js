var Joi = require('joi');

module.exports = {
  payload: {
    email: Joi.string().email().required(),
    password: Joi.string().min(1).required(),
    // TODO: make min 6
    failAction: 'error'
  }
};
