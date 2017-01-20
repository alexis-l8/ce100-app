var Joi = require('joi');
var activateAccountView = require('../handlers/people/activate-account-view.js');

module.exports = {
  payload: {
    password: Joi.string().min(6).required(),
    confirm_password: Joi.any().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } })
  },
  failAction: function (req, rep, src, err) {
    // we want the user to be redirected to the correct version of activate
    // account view
    var userFlow = req.path.indexOf('password-reset') > -1
      ? 'reset'
      : 'activate';
      
    return activateAccountView(userFlow)(req, rep, src, err);
  }
};
