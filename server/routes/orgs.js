module.exports = [
  {
    method: 'GET',
    path: '/orgs',
    handler: require('../handlers/browse-view.js')
  },
  {
    method: 'GET',
    path: '/orgs/tags',
    handler: require('../handlers/browse-add-tags-view.js')
  },
  {
    method: 'GET',
    path: '/orgs/add',
    handler: require('../handlers/serve-view.js')('organisations/add'),
    config: {
      auth: { scope: 'admin' }
    }
  },
  {
    method: 'POST',
    path: '/orgs/add',
    handler: require('../handlers/create-new-org.js'),
    config: {
      auth: { scope: 'admin' },
      validate: require('../models/admin-add-org.js')
    }
  },
  {
    method: 'GET',
    path: '/orgs/{id}',
    handler: require('../handlers/org-details-view.js')
  },
  {
    method: 'GET',
    path: '/orgs/{id}/edit',
    handler: require('../handlers/edit-org-view.js')
  },
  {
    method: 'POST',
    path: '/orgs/{id}/edit',
    handler: require('../handlers/edit-org.js'),
    config: {
      validate: require('../models/admin-edit-org.js')
    }
  },
  {
    method: 'GET',
    path: '/orgs/{id}/toggle-archive',
    handler: require('../handlers/toggle-archive-org.js')
  },
  {
    method: 'GET',
    path: '/orgs/{id}/tags',
    handler: require('../handlers/org-select-tags-view.js')
  },
  {
    method: 'POST',
    path: '/orgs/{id}/tags',
    handler: require('../handlers/org-select-tags.js')
  }
];
