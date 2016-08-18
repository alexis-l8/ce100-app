const handlers = {};

handlers.serveFile = (request, reply) => {
  reply.view(request.params.path);
};

handlers.createNewPrimaryUser = (request, reply) => {
  const payload = request.payload;
  const allPeople = request.redis.SCARD('people', (err, length) => {
    if (err) {
      console.log(err);
      reply('redis-failure');
    } else {
      const additionalInfo = {
        id: length,
        active: true
      }
      const newUser = Object.assign(additionalInfo, payload);
      request.redis.SADD('people', JSON.stringify(newUser), (error, people) => {
        if (error) {
          console.log('ERROR', error);
          reply('redis-failure');
        } else {
          request.redis.SMEMBERS('organisation', (error, orgs) => {
            if (error) {
              console.log('ERROR', error);
              reply('redis-failure');
            } else {
              request.redis.DEL('organisation', (error, response) => {
                if (response) {
                  const orgId = payload.organisation_id;
                  const org = JSON.parse(orgs[orgId]);
                  const orgUpdated =
                  Object.assign({
                    primary_id: newUser.id,
                    people: org.people ? org.people.push(newUser.id) : [newUser.id]
                  }, org);
                  orgs[orgId] = JSON.stringify(orgUpdated);
                  request.redis.SADD('organisation', orgs, (error, data) => {
                    if (error) {
                      console.log('ERROR', error);
                      reply('redis-failure');
                    } else {
                      reply.view('add-user');
                    }
                  });
                } else {
                  console.log('ERROR', error);
                  reply('redis-failure');
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
