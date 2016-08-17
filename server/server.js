const Hapi = require('hapi');
const server = new Hapi.Server();

const path = require('path');
//plugins
const Vision = require('vision');

const routes = require('./routes.js');

const handlebars = require('handlebars');

server.connection({ port: 3000 });

server.register([Vision], err => {

  // TODO: look into hoek
  // Hoek.assert(!err, err)
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
