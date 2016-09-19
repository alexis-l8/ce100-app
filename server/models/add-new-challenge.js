var Joi = require('joi');

module.export = {
  payload: {
    title: Joi.string().min(1).required(),
    description: Joi.string().min(1).required()
    // tags: Joi.array.items(Joi.array.items(Joi.number())).max(10)
  }
};
