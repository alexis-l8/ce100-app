var Joi = require('joi');

module.exports = {
  payload: {
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  },
  failAction: require('../handlers/serve-view.js')('login')
};
