var Joi = require('joi');

// TODO: Dynamic model depending on user_type

module.exports = {
  payload: {
    name: Joi.string().min(1).required(),
    mission_statement: Joi.any().optional()
  }
};
