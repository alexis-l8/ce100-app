'use strict';

var browsePeople = require('../handlers/people/browse-people.js');
var addView = require('../handlers/people/add-view.js');
var activateAccountView = require('../handlers/people/activate-account-view.js');
var activateAccount = require('../handlers/people/activate-account.js');
var toggleActive = require('../handlers/people/toggle-active.js');

module.exports = [
  {
    method: 'GET',
    path: '/people',
    handler: browsePeople
  },
  {
    method: 'GET',
    path: '/people/add',
    handler: addView,
    config: { auth: { scope: 'admin' } }
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
    method: 'POST',
    path: '/people/{id}/toggle-active',
    handler: toggleActive
  },
  {
    method: 'GET',
    path: '/people/activate/{hashedId}',
    handler: activateAccountView,
    config: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/people/activate/{hashedId}',
    handler: activateAccount,
    config: {
      validate: require('../models/confirm-password.js'),
      auth: false
    }
  }
];
