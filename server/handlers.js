const handlers = {};

handlers.serveFile = (request, reply) => {
  reply.view(request.params.path);
};

handlers.createNewPrimaryUser = (request, reply) => {
  const allPeople = request.redis.smembers('people', (err, data) => {
    if (err) {
      console.log(err);
      reply('could not access people set');
    } else {
      const additionalInfo = {
        id: data.length,
        active: true
      }
      const newUser = JSON.stringify(Object.assign(additionalInfo, request.payload));
      request.redis.SADD('people', newUser);
      reply.view('add-user');

    }
  });
};

handlers.login = (request, reply) => {

};

module.exports = handlers;
