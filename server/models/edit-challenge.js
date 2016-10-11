var Joi = require('joi');

module.exports = {
  payload: {
    title: Joi.string().min(1).required(),
    description: Joi.string().min(1).required()
  },
  failAction: require('../handlers/edit-challenge-view.js')
};