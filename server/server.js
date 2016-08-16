const Hapi = require('hapi');

const server = new Hapi.Server();

server.connection({ port: 3000 });

server.route({
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    reply('Hello world');
  }
});

module.exports = server;
