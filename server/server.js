const Hapi = require('hapi');
const Hoek = require('hoek');

// plugins
const Vision = require('vision');
const HapiRedisConnection = require('hapi-redis-connection');

const path = require('path');
const handlebars = require('handlebars');

const routes = require('./routes.js');
const server = new Hapi.Server();

server.connection({ port: 3000 });

server.register([Vision, HapiRedisConnection], err => {
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
