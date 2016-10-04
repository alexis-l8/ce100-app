var Joi = require('joi');

module.exports = {
  payload: (value, options, next) => {
    var scope = options.context.auth.credentials.scope;
    return Joi.validate(value, schema[scope], next);
  },
  failAction: require('../handlers/edit-org-view.js')
};

var schema = {
  admin: {
    name: Joi.string().min(1).required(),
    mission_statement: Joi.any().optional()
  },
  primary: {
    mission_statement: Joi.any().optional()
  }
};
