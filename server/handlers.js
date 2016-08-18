const Bcrypt = require('bcrypt');
const redis = require('redis');
const handlers = {};

handlers.serveFile = (request, reply) => {
  reply.view(request.params.path);
}

handlers.createNewPrimaryUser = (request, reply) => {
  reply('ok');
}

handlers.login = (request, reply) => {
  
}

module.exports = handlers;
