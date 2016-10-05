var Joi = require('joi');

module.exports = {
  payload: (value, options, next) => {
    var tags;
    if (typeof value.tags === 'string') {
      tags = value.tags === '' ? schema.empty : schema.single;
    } else tags = schema.multiple;
    return Joi.validate(value, { tags: tags }, next);
  },
  failAction: require('../handlers/select-tags-view.js')
};

var schema = {
  empty: Joi.any().valid(''),
  single: Joi.string(),
  multiple: Joi.array().max(10).options({ language: {array: {max: 'a maximum of 10 tags can be chosen'}}})
};
