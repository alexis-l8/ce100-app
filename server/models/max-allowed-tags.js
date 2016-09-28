var Joi = require('joi');

module.exports = {
  payload: (value, options, next) => {
    var tags;
    if (typeof value.tags === 'string') {
      tags = value.tags === '' ? schema.empty : schema.single;
    } else tags = schema.multiple;
    return Joi.validate(value, { tags: tags }, next);
  }
};

var schema = {
  empty: Joi.any().valid(''),
  single: Joi.string(),
  multiple: Joi.array().max(10)
};
