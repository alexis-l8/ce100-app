var Joi = require('joi');

module.exports = {
  payload: {
    name: Joi.string().min(1).required(),
    logo_url: Joi.any().optional()
  },
  failAction: require('../handlers/serve-view.js')('organisations/add')
};
