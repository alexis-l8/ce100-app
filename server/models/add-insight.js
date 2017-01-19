'use strict';

var Joi = require('joi');
var addInsightView = require('../handlers/insights/add-view.js');

module.exports = {
  payload: {
    title: Joi.string().min(1).required(),
    url: Joi.string().min(1).required(),
    author: Joi.string().min(1).required(),
    type: Joi.string().valid('CASE STUDY', 'PAPER', 'PRESENTATION', 'REPORT', 'VIDEO', 'WORKSHOP SUMMARY').required(),
    resource: Joi.any().optional(),
    active: Joi.boolean()
  },
  failAction: addInsightView
};
