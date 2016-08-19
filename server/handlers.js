const handlers = {};

handlers.serveFile = (request, reply) => {
  reply.view(request.params.path);
};

handlers.createNewPrimaryUser = (request, reply) => {
  const payload = request.payload;
  request.redis.LLEN('people', (error, length) => {
    if (error) {
      console.log(error);
      reply('redis-failure');
    } else {
      const additionalInfo = {
        id: length,
        active: true
      };
      const newUser = Object.assign(additionalInfo, payload);
      request.redis.RPUSH('people', JSON.stringify(newUser), (error, people) => {
        if (error) {
          console.log('ERROR', error);
          reply('redis-failure');
        } else {
          const orgId = payload.organisation_id;
          request.redis.LINDEX('organisations', orgId, (error, org) => {
            if (error) {
              console.log('ERROR', error);
              reply('redis-failure');
            } else {
              console.log('org redis', org);
              const orgOld = JSON.parse(org);
              const orgUpdated =
                Object.assign({
                  primary_id: newUser.id,
                  people: orgOld.people ? orgOld.people.push(newUser.id) : [newUser.id]
                }, orgOld);
              request.redis.LSET('organisations', orgId, JSON.stringify(orgUpdated), (error, response) => {
                if (error) {
                  console.log('ERROR', error);
                  reply('redis-failure');
                } else {
                  reply('success');
                }
              });
            }
          });
        }
      });
    }
  });
};

handlers.login = (request, reply) => {

};

module.exports = handlers;
