'use strict';

var browsePeople = require('../handlers/people/browse-people.js');
var addView = require('../handlers/people/add-view.js');
var add = require('../handlers/people/add.js');
var activateAccountView = require('../handlers/people/activate-account-view.js');
var activateAccount = require('../handlers/people/activate-account.js');
var editView = require('../handlers/people/edit-view.js');
var edit = require('../handlers/people/edit.js');
var editModel = require('../models/edit-user.js');
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
    handler: add,
    config: {
      auth: { scope: 'admin' },
      validate: require('../models/admin-add-user.js')
    }
  },
  {
    method: 'GET',
    path: '/people/{id}/edit',
    handler: editView
  },
  {
    method: 'POST',
    path: '/people/{id}/edit',
    handler: edit,
    config: { validate: editModel }
  },
  {
    method: 'GET',
    path: '/people/{id}/toggle-active',
    handler: toggleActive,
    config: { auth: { scope: 'admin' } }
  },
  {
    method: 'GET',
    path: '/people/activate/{hashedId}',
    handler: activateAccountView,
    config: { auth: false }
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
