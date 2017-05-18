var Joi = require('joi');

module.exports = {
  payload: function (value, options, next) {
    var scope = options.context.auth.credentials.scope;
    return Joi.validate(value, schema[scope], next);
  },
  failAction: require('../handlers/orgs/edit-org-view.js')
};

var schema = {
  admin: {
    name: Joi.string().min(1).required(),
    mission_statement: Joi.any().optional(),
    file_name: Joi.any().optional(),
    logo: Joi.any().optional(),
    tags: [Joi.array(), Joi.string()]
  },
  primary: {
    mission_statement: Joi.any().optional(),
    tags: [Joi.array(), Joi.string()]
  }
};
