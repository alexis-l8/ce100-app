var Joi = require('joi');

module.exports = {
  payload: (value, options, next) => {
    var scope = options.context.auth.credentials.scope;
    var additional;
    if (scope === 'primary') {
      if (value.old_password || value.new_password || value.confirm_new_password) {
        // check that old password has min 6, new password has 6, new password equals confirm new password
        additional = changePassword;
      } else {
        additional = unchangedPassword;
      }
    } else {
      additional = admin;
    }
    var schema = Object.assign({}, base, additional);
    return Joi.validate(value, schema, next);
  }
};

var changePassword = {
  old_password: Joi.string().min(6).required(),
  new_password: Joi.string().min(6).required(),
  confirm_new_password: Joi.any().valid(Joi.ref('new_password')).required()
};

var unchangedPassword = {
  old_password: Joi.any().empty(),
  new_password: Joi.any().empty(),
  confirm_new_password: Joi.any().empty()
};

var admin = {
  organisation_id: Joi.number().min(-1).required(),
  user_type: Joi.string().valid('admin', 'primary')
};

var base = {
  first_name: Joi.string().min(1).required(),
  last_name: Joi.string().min(1).required(),
  job_title: Joi.any().optional(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(8).max(13)
};
