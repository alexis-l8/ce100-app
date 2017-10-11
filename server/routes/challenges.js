'use strict';

var browseAddTagsView = require('../handlers/shared/browse-add-tags-view.js');
var toggleActive = require('../handlers/challenges/toggle-active.js');
var addView = require('../handlers/challenges/add-view.js');
var addSubmit = require('../handlers/challenges/add.js');
var addModel = require('../models/add-challenge.js');
var browseChallenges = require('../handlers/challenges/browse-challenges.js');
var editView = require('../handlers/challenges/edit-view.js');
var editSubmit = require('../handlers/challenges/edit.js');
var editModel = require('../models/edit-challenge.js');
var challengeView = require('../handlers/challenges/challenge-view.js');

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
    path: '/challenges/{id}',
    handler: challengeView
  },
  {
    method: 'GET',
    path: '/challenges/add',
    handler: addView,
    config: { auth: { scope: 'primary' } }
  },
  {
    method: 'POST',
    path: '/challenges/add',
    handler: addSubmit,
    config: {
      validate: addModel,
      auth: { scope: 'primary' }
    }
  },
  {
    method: 'GET',
    path: '/challenges/{id}/edit',
    handler: editView,
    config: { auth: { scope: ['primary', 'admin'] } }
  },
  {
    method: 'POST',
    path: '/challenges/{id}/edit',
    handler: editSubmit,
    config: {
      validate: editModel,
      auth: { scope: ['primary', 'admin'] }
    }
  },
  {
    method: 'GET',
    path: '/challenges/{id}/toggle-active',
    handler: toggleActive,
    config: { auth: { scope: ['primary', 'admin'] } }
  }
];
