module.exports = [
  {
    method: 'GET',
    path: '/challenges',
    handler: require('../handlers/browse-view.js')
  },
  {
    method: 'GET',
    path: '/challenges/tags',
    handler: require('../handlers/browse-add-tags-view.js')
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
