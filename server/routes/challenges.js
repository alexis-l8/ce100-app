'use strict';

var view = require('../handlers/serve-view.js');
var browseAddTagsView = require('../handlers/shared/browse-add-tags-view.js');
var toggleActive = require('../handlers/challenges/toggle-active.js');
var addTags = require('../handlers/challenges/add-tags.js');
var browseChallenges = require('../handlers/challenges/browse-challenges.js');
var addView = require('../handlers/challenges/add-view.js');
var addSubmit = require('../handlers/challenges/add.js');
var editView = require('../handlers/challenges/edit-view.js');
var editSubmit = require('../handlers/challenges/edit.js');
var editModel = require('../models/edit-challenge.js');

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
    path: '/challenges/{challengeId}/tags',
    handler: require('../handlers/select-tags-view.js')
  },
  {
    method: 'POST',
    path: '/challenges/{challengeId}/tags',
    handler: addTags,
    config: {
      validate: require('../models/max-allowed-tags.js')
    }
  },
  {
    method: 'GET',
    path: '/challenges/add',
    handler: addView
  },
  {
    method: 'POST',
    path: '/challenges/add',
    handler: addSubmit,
    config: {
      validate: require('../models/add-challenge.js'),
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
    method: 'GET',
    path: '/challenges/{id}/toggle-active',
    handler: toggleActive
  }
];
