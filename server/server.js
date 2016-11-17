'use strict';

var Hapi = require('hapi');
var path = require('path');
var inert = require('inert');
var handlebars = require('handlebars');
var vision = require('vision');
var hapiRedisConnection = require('hapi-redis-connection');
var hapiError = require('hapi-error');
var tags = require('tags-system');
var tagsData = require('../tags/tags.json');
var categoriesData = require('../tags/categories.json');
var auth = require('./auth.js');
var routes = require('./routes.js');
var pg = require('pg');

function initServer (config, callback) {
  var server = new Hapi.Server();
  var pool = new pg.Pool(config.pg);

  server.connection({ port: config.port });

  server.register([
    inert,
    vision,
    hapiRedisConnection,
    hapiError,
    auth,
    {
      register: tags,
      options: {
        tags: tagsData,
        categories: categoriesData,
        pool: pool
      }
    }
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

    return callback(null, server);
  });
}

module.exports = initServer;
