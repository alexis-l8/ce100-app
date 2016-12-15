'use strict';

var view = require('../handlers/serve-view.js');
var browseAddTagsView = require('../handlers/shared/browse-add-tags-view.js');
var toggleActive = require('../handlers/challenges/toggle-active.js');
var addTagsView = require('../handlers/challenges/add-tags-view.js');
var addTags = require('../handlers/challenges/add-tags.js');
var addView = require('../handlers/challenges/add-view.js');
var add = require('../handlers/challenges/add.js');
var addModel = require('../models/add-challenge.js');
var browseChallenges = require('../handlers/challenges/browse-challenges.js');
var editView = require('../handlers/challenges/edit-view.js');
var editSubmit = require('../handlers/challenges/edit.js');
var editModel = require('../models/edit-challenge.js');
var maxAllowedTags = require('../models/max-allowed-tags.js');

module.exports = [
  {
    method: 'GET',
    path: '/challenges',
    handler: browseChallenges
  },
  {
    method: 'GET',
    path: '/challenges/tags',
    handler: browseAddTagsView('challenges')
  },
  {
    method: 'GET',
    path: '/challenges/{id}/tags',
    handler: addTagsView
  },
  {
    method: 'POST',
    path: '/challenges/{id}/tags',
    handler: addTags,
    config: { validate: maxAllowedTags }
  },
  {
    method: 'GET',
    path: '/challenges/add',
    handler: addView
  },
  {
    method: 'POST',
    path: '/challenges/add',
    handler: add,
    config: {
      validate: addModel,
      auth: { scope: 'primary' }
    }
  },
  {
    method: 'GET',
    path: '/challenges/{id}/edit',
    handler: editView
  },
  {
    method: 'POST',
    path: '/challenges/{id}/edit',
    handler: editSubmit,
    config: { validate: editModel }
  },
  {
    method: 'POST',
    path: '/challenges/{id}/toggle-active',
    handler: toggleActive
  }
];
