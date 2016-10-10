require('env2')('.env');
var Hapi = require('hapi');
var Hoek = require('hoek');
var path = require('path');

var server = new Hapi.Server();

server.connection({ port: process.env.PORT || 3000 });

server.register([
  require('inert'),
  require('vision'),
  require('hapi-redis-connection'),
  require('hapi-error'),
  // custom plugins
  require('./auth.js')
], err => {
  Hoek.assert(!err, err);

  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: path.resolve(__dirname),
    layout: 'default',
    layoutPath: '../templates/layout',
    path: '../templates/views',
    partialsPath: '../templates/partials',
    helpersPath: '../templates/helpers'
  });
});

server.route(require('./routes.js'));

module.exports = server;
