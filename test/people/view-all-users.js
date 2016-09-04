const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');

const mockData = require('../mock-data.js');

// TODO: Route should be authed

tape('set up db: add organisation, add primary user to that organisation', t => {
  const stringifiedPeople = mockData.initialPeople.map(person => JSON.stringify(person));
  client.RPUSH('people', stringifiedPeople, (error, response) => {
    if (error) console.log(error);
    t.ok(response, 'adding a primary user: response from redis is ' + response);
    t.end();
  });
});

tape('/people page loads', t => {
  const options = {
    method: 'GET',
    url: '/people'
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.end();
  });
});

tape.onFinish(() => {
  console.log('on finish, admin-adds primaryUserId');
  // client.FLUSHDB();
  client.end(true);
  server.stop(() => {});
});
