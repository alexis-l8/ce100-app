'use strict';

var Joi = require('joi');
var failChal = require('../handlers/challenges/add-tags-view.js');
var failOrg = require('../handlers/orgs/add-tags-view.js');
var failInsight = require('../handlers/insights/add-tags-view.js');

var schema = {
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
    var tags = typeof value.tags === 'string' ? schema.single : schema.multiple;

    return Joi.validate(value, { tags: tags }, next);
  },
  failAction: function (request, reply, source, error) {
    var view = request.path.split('/')[1];
    if (view === 'challenges') {
      return failChal(request, reply, source, error);
    }
    else if (view === 'orgs') {
      return failOrg(request, reply, source, error);
    }
    else if (view === 'insights') {
      return failInsight(request, reply, source, error);
    }
  }
};
