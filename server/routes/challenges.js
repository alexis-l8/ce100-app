'use strict';

var view = require('../handlers/serve-view.js');
var browseAddTagsView = require('../handlers/shared/browse-add-tags-view.js');
var addTags = require('../handlers/challenges/add-tags.js');
var add = require('../handlers/challenges/add.js');
var browseChallenges = require('../handlers/challenges/browse-challenges.js');

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
    handler: view('challenges/add')
  },
  {
    method: 'POST',
    path: '/challenges/add',
    handler: add,
    config: {
      validate: require('../models/add-challenge.js'),
      auth: { scope: 'primary' }
    }
  },
  {
    method: 'GET',
    path: '/challenges/{id}/edit',
    handler: require('../handlers/edit-challenge-view.js')
  },
  {
    method: 'POST',
    path: '/challenges/{id}/edit',
    handler: require('../handlers/edit-challenge.js'),
    config: {
      validate: require('../models/edit-challenge.js')
    }
  },
  {
    method: 'GET',
    path: '/challenges/{id}/toggle-archive',
    handler: require('../handlers/toggle-archive-challenge.js')
  }
];
