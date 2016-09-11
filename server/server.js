require('env2')('config.env');
const Hapi = require('hapi');
const Hoek = require('hoek');
const path = require('path');
const server = new Hapi.Server();

require('../test/helpers/set-up.js').initialiseDB(() => {});

server.connection({ port: 3000 });

server.register([ // one plugin per line
  require('vision'),
  require('hapi-redis-connection'),
  // custom plugins
  require('./auth.js')
], err => {
  Hoek.assert(!err, err);

  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: path.resolve(__dirname, '..'),
    path: 'templates/views',
    partialsPath: 'templates/partials',
    helpersPath: 'templates/helpers'
  });
});

server.route(require('./routes.js'));

server.start(err => {
  Hoek.assert(!err, err);
  console.log(`Server running at port: ${server.info.uri}`);
});

module.exports = server;
