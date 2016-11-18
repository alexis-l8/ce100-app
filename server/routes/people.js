module.exports = [
  {
    method: 'GET',
    path: '/people',
    handler: require('../handlers/all-users-view.js')
  },
  {
    method: 'GET',
    path: '/people/add',
    handler: require('../handlers/create-user-view.js'),
    config: {
      auth: { scope: 'admin' }
    }
  },
  {
    method: 'POST',
    path: '/people/add',
    handler: require('../handlers/create-new-user.js'),
    config: {
      auth: { scope: 'admin' },
      validate: require('../models/admin-add-user.js')
    }
  },
  {
    method: 'GET',
    path: '/people/{id}/edit',
    handler: require('../handlers/edit-user-view.js')
  },
  {
    method: 'POST',
    path: '/people/{id}/edit',
    handler: require('../handlers/edit-user.js'),
    config: {
      validate: require('../models/edit-user.js')
    }
  },
  {
    method: 'GET',
    path: '/people/{id}/toggle-archive',
    handler: require('../handlers/toggle-archive-user.js')
  },
  {
    method: 'GET',
    path: '/people/activate/{hashedId}',
    handler: require('../handlers/activate-account-view.js'),
    config: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/people/activate/{hashedId}',
    handler: require('../handlers/activate-user-account.js'),
    config: {
      validate: require('../models/confirm-password.js'),
      auth: false
    }
  }
];