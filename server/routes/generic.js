'use strict';

var serveFile = require('../handlers/serve-file.js');

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      return reply.redirect('/orgs');
    }
  },
  {
    method: 'GET',
    path: '/{path*}',
    handler: serveFile,
    config: { auth: false }
  }
];
