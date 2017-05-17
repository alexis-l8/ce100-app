var Joi = require('joi');

module.exports = {
  payload: {
    title: Joi.string().min(1).required().options({ language: { any: { empty: '!!Please add a challenge title to continue.' } } }),
    description: Joi.string().min(1).required(),
    tags: [Joi.array(), Joi.string()]
  },
  failAction: require('../handlers/challenges/edit-view.js')
};
