const Hapi = require('hapi');
const Hoek = require('hoek');

// plugins
const Vision = require('vision');
const HapiRedisConnection = require('hapi-redis-connection');
const path = require('path');
const handlebars = require('handlebars');
const Cookie = require('hapi-auth-cookie');
const Auth = require('./auth.js');

const routes = require('./routes.js');
const server = new Hapi.Server();

server.connection({ port: 3000 });

server.register([Vision, HapiRedisConnection, Cookie, Auth], err => {
  Hoek.assert(!err, err);

  server.views({
    engines: {
      html: handlebars
    },
    relativeTo: path.resolve(__dirname, '..'),
    path: './templates/views',
    helpersPath: './templates/helpers'
  });
});

server.route(routes);

module.exports = server;
