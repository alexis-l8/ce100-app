const handlers = {};

handlers.serveFile = (request, reply) => {
  reply.view(request.params.path);
}

handlers.createNewPrimaryUser = (request, reply) => {
  reply('ok');
}

module.exports = handlers;
