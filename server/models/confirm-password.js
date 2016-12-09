var Joi = require('joi');

module.exports = {
  payload: {
    password: Joi.string().min(6).required(),
    confirm_password: Joi.any().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } })
  },
  failAction: require('../handlers/people/activate-account-view.js')
};
