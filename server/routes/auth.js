'use strict';

var loginView = require('../handlers/serve-view.js')('login');
var login = require('../handlers/auth/login.js');
var loginSchema = require('../models/login.js');
var logout = require('../handlers/auth/logout.js');
var passwordReset = require('../handlers/auth/password-reset.js');

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
  },
  {
    method: 'POST',
    path: '/password-reset',
    handler: passwordReset,
    config: { auth: false }
  },
  {
    method: 'GET',
    path: '/password-reset',
    handler: require('../handlers/serve-view.js')('request-password-reset'),
    config: { auth: false }
  }
];
