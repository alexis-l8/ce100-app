'use strict';

var toggleActive = require('../handlers/insights/toggle-active.js');
var addModel = require('../models/add-insight.js');
var editView = require('../handlers/insights/edit-view.js');
var editSubmit = require('../handlers/insights/edit.js');
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
    path: '/insights/{id}/toggle-active',
    handler: toggleActive
  },
  {
    method: 'GET',
    path: '/insights/{id}/edit',
    handler: editView
  },
  {
    method: 'POST',
    path: '/insights/{id}/edit',
    handler: editSubmit,
  },
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
