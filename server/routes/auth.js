'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/login',
    handler: require('../handlers/serve-view.js')('login'),
    config: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/login',
    handler: require('../handlers/auth/login.js'),
    config: {
      auth: false,
      validate: require('../models/login.js')
    }
  },
  {
    method: 'GET',
    path: '/logout',
    handler: require('../handlers/auth/logout.js')
  }
];
