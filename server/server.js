require('env2')('config.env');
const Hapi = require('hapi');
const Hoek = require('hoek');
const path = require('path');

// plugins
const Vision = require('vision');
const HapiRedisConnection = require('hapi-redis-connection');
const handlebars = require('handlebars');

// custom plugins
const Auth = require('./auth.js');

const routes = require('./routes.js');
const server = new Hapi.Server();

server.connection({ port: 3000 });

server.register([Vision, HapiRedisConnection, Auth], err => {
  Hoek.assert(!err, err);

  server.views({
    engines: {
      html: handlebars
    },
    relativeTo: path.resolve(__dirname, '..'),
    path: 'templates/views',
    partialsPath: 'templates/partials',
    helpersPath: 'templates/helpers'
  });
});

server.route(routes);

module.exports = server;
