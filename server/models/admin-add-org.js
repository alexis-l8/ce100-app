var Joi = require('joi');

module.exports = {
  payload: {
    name: Joi.string().min(1).required()
  },
  failAction: require('../handlers/serve-view.js')('organisations/add')
};
