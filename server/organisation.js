// directories and file names need to be fixed
var Joi = require('joi');
var validate = {};

validate.adminEditOrg = {
  payload: {
    name: Joi.string().min(1).required(),
    mission_statement: Joi.any().optional()
  }
};

module.exports = validate;
