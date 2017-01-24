var Joi = require('joi');

module.exports = {
  payload: {
    name: Joi.string().min(1).required(),
    file_name: Joi.any().optional(),
    logo: Joi.any().optional()
  },
  failAction: require('../handlers/serve-view.js')('organisations/add')
};
