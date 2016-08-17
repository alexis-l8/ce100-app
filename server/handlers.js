const handlers = {};

handlers.serveFile = (request, reply) => {
  reply.view(request.params.path);
}

module.exports = handlers;
