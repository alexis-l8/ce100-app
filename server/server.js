const Hapi = require('hapi');
const server = new Hapi.Server();
const Hoek = require('hoek');
const path = require('path');
//  plugins
const Vision = require('vision');
const HapiRedisConnection = require('hapi-redis-connection');
const routes = require('./routes.js');

const handlebars = require('handlebars');

server.connection({ port: 3000 });

server.register([Vision, HapiRedisConnection], err => {
  Hoek.assert(!err, err);

  server.views({
    engines: {
      html: handlebars
    },
    relativeTo: path.resolve(__dirname, '..'),
    path: './templates',
    layoutPath: './templates/layout',
    helpersPath: './templates/helpers'
  });
});

server.route(routes);

module.exports = server;
