'use strict';

var addTagsView = require('../handlers/insights/add-tags-view.js');
var addTags = require('../handlers/insights/add-tags.js');
var maxAllowedTags = require('../models/max-allowed-tags.js');
var browseInsights = require('../handlers/insights/browse-insights.js');
var addView = require('../handlers/insights/add-view.js');
var addSubmit = require('../handlers/insights/add.js');
var addModel = require('../models/add-insight.js');

module.exports = [
  {
    method: 'GET',
    path: '/insights/{id}/tags',
    handler: addTagsView
  },
  {
    method: 'POST',
    path: '/insights/{id}/tags',
    handler: addTags,
    config: { validate: maxAllowedTags }
  },
  {
    method: 'GET',
    path: '/insights',
    handler: browseInsights
  },
  {
    method: 'GET',
    path: '/insights/add',
    handler: addView
  },
  {
    method: 'POST',
    path: '/insights/add',
    handler: addSubmit,
    config: { validate: addModel }
  }
];
