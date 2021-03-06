'use strict';

var toggleActive = require('../handlers/insights/toggle-active.js');
var addModel = require('../models/add-insight.js');
var editView = require('../handlers/insights/edit-view.js');
var editSubmit = require('../handlers/insights/edit.js');
var browseInsights = require('../handlers/insights/browse-insights.js');
var addView = require('../handlers/insights/add-view.js');
var addSubmit = require('../handlers/insights/add.js');
var browseAddTagsView = require('../handlers/shared/browse-add-tags-view.js');
var browseResources = require('../handlers/insights/browse-resources.js');

module.exports = [
  {
    method: 'GET',
    path: '/insights/{id}/toggle-active',
    handler: toggleActive,
    config: {
      auth: { scope: ['admin', 'content-owner'] }
    }
  },
  {
    method: 'GET',
    path: '/insights/{id}/edit',
    handler: editView,
    config: {
      auth: { scope: ['admin', 'content-owner'] }
    }
  },
  {
    method: 'POST',
    path: '/insights/{id}/edit',
    handler: editSubmit,
    config: { auth: { scope: ['admin', 'content-owner'] } }
  },
  {
    method: 'GET',
    path: '/insights',
    handler: browseInsights
  },
  {
    method: 'GET',
    path: '/insights/add',
    handler: addView,
    config: {
      auth: { scope: ['admin', 'content-owner'] }
    }
  },
  {
    method: 'POST',
    path: '/insights/add',
    handler: addSubmit,
    config: {
      auth: { scope: ['admin', 'content-owner'] },
      validate: addModel
    }
  },
  {
    method: 'GET',
    path: '/insights/tags',
    handler: browseAddTagsView('insights')
  },
  {
    method: 'GET',
    path: '/resources',
    handler: browseResources
  }
];
