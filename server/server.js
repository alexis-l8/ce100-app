const Hapi = require('hapi');
const Hoek = require('hoek');
const Vision = require('vision');

const path = require('path');
const handlebars = require('handlebars');
const routes = require('./routes.js');

const server = new Hapi.Server();

server.connection({ port: 3000 });

server.register([Vision], err => {

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
