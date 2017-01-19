'use strict';

var serveFile = require('../handlers/serve-file.js');
var landing = require('../handlers/landing.js');

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: landing
  },
  {
    method: 'GET',
    path: '/{path*}',
    handler: serveFile,
    config: { auth: false }
  }
];
