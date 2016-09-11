require('env2')('config.env');
const Hapi = require('hapi');
const Hoek = require('hoek');
const path = require('path');

// plugins
const Vision = require('vision');
const HapiRedisConnection = require('hapi-redis-connection');
const handlebars = require('handlebars');
const Inert = require('inert');

// custom plugins
const Auth = require('./auth.js');

const routes = require('./routes.js');
const server = new Hapi.Server();

// require('../test/helpers/set-up.js').initialiseDB(() => {});

server.connection({ port: 3000 });

server.register([Inert, Vision, HapiRedisConnection, Auth], err => {
  Hoek.assert(!err, err);

  server.views({
    engines: {
      html: handlebars
    },
    relativeTo: path.resolve(__dirname),
    layout: 'default',
    layoutPath: '../templates/layout',
    path: '../templates/views',
    partialsPath: '../templates/partials',
    helpersPath: '../templates/helpers'
  });
});

server.route(routes);

module.exports = server;
