var Joi = require('joi');

module.exports = {
  payload: {
    name: Joi.string().min(1).required(),
  }
};
