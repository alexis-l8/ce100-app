'use strict';

var browseAddTagsView = require('../handlers/shared/browse-add-tags-view.js');
var editView = require('../handlers/challenges/edit-view.js');
var editSubmit = require('../handlers/challenges/edit.js');
var editModel = require('../models/edit-challenge.js');

module.exports = [
  {
    method: 'GET',
    path: '/challenges',
    handler: require('../handlers/browse-view.js')
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
    handler: require('../handlers/select-tags.js'),
    config: {
      validate: require('../models/max-allowed-tags.js')
    }
  },
  {
    method: 'GET',
    path: '/challenges/add',
    handler: require('../handlers/add-challenge-view.js')
  },
  {
    method: 'POST',
    path: '/challenges/add',
    handler: require('../handlers/add-challenge.js'),
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
    path: '/challenges/{id}/toggle-archive',
    handler: require('../handlers/toggle-archive-challenge.js')
  }
];
