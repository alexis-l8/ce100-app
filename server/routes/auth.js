'use strict';

var loginView = require('../handlers/serve-view.js')('login');
var login = require('../handlers/auth/login.js');
var loginSchema = require('../models/login.js');
var logout = require('../handlers/auth/logout.js');

module.exports = [
  {
    method: 'GET',
    path: '/login',
    handler: loginView,
    config: { auth: false }
  },
  {
    method: 'POST',
    path: '/login',
    handler: login,
    config: {
      auth: false,
      validate: loginSchema
    }
  },
  {
    method: 'GET',
    path: '/logout',
    handler: logout
  }
];
