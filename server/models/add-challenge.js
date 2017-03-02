var Joi = require('joi');

module.exports = {
  payload: {
    title: Joi.string().min(1).required().options({ language: { any: { empty: '!!Please add a challenge title to continue.' } } }),
    description: Joi.string().min(1).required()
  },
  failAction: require('../handlers/challenges/add-view.js')
};
