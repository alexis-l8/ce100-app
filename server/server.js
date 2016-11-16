'use strict';

var Hapi = require('hapi');
var path = require('path');
var inert = require('inert');
var handlebars = require('handlebars');
var vision = require('vision');
var hapiRedisConnection = require('hapi-redis-connection');
var hapiError = require('hapi-error');
var auth = require('./auth.js');
var routes = require('./routes.js');

function initServer (config, callback) {
  var server = new Hapi.Server();

  server.connection({ port: config.port || 3000 });

  server.register([
    inert,
    vision,
    hapiRedisConnection,
    hapiError,
    auth
  ], function (err) {
    if (err) {
      return callback(err);
    }

    server.views({
      engines: { html: handlebars },
      relativeTo: path.resolve(__dirname),
      layout: 'default',
      layoutPath: '../templates/layout',
      path: '../templates/views',
      partialsPath: '../templates/partials',
      helpersPath: '../templates/helpers'
    });

    server.route(routes);

    return server.start(function (error) {
      return callback(error, server);
    });
  });
}

module.exports = initServer;
