const handlers = {};

handlers.serveFile = (request, reply) => {
  reply.view(request.params.path);
};

handlers.createNewPrimaryUser = (request, reply) => {
  const stringified = JSON.stringify(request.payload);
  // make new db

  request.redis.SADD('users', stringified);
  reply.view('add-user');
};

handlers.login = (request, reply) => {

};

module.exports = handlers;
