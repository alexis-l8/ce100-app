'use strict';

var serveFile = require('../handlers/serve-file.js');
var landing = require('../handlers/landing/landing.js');
var search = require('../handlers/search.js')

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
  },
  {
    method: 'GET',
    path: '/search',
    handler: search
  }
];
