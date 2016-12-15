'use strict';

var Joi = require('joi');
var failChal = require('../handlers/challenges/add-tags-view.js');
var failOrg = require('../handlers/orgs/add-tags-view.js');

var schema = {
  empty: Joi.any().valid(''),
  single: Joi.string(),
  multiple: Joi.array().max(10)
    .options({
      language: {
        array:
          { max: 'a maximum of 10 tags can be chosen' }
      }
    })
};

module.exports = {
  payload: function (value, options, next) {
    var tags;

    if (typeof value.tags === 'string') {
      tags = value.tags === ''
      ? schema.empty
      : schema.single;
    } else {
      tags = schema.multiple;
    }

    return Joi.validate(value, { tags: tags }, next);
  },
  failAction: function (request, reply, source, error) {
    return request.path.split('/')[1] === 'challenges'
      ? failChal(request, reply, source, error)
      : failOrg(request, reply, source, error);
  }
};
