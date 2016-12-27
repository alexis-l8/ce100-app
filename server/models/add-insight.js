'use strict';

var Joi = require('joi');
var addInsightView = require('../handlers/insights/add-view.js');

module.exports = {
  payload: {
    title: Joi.string().min(1).required(),
    url: Joi.string().min(1).required(),
    author: Joi.string().min(1).required(),
    doctype: Joi.string().valid('.pdf', '.jpeg', '.txt', '.html').required(),
    resource: Joi.any().optional()
  },
  failAction: addInsightView
};
