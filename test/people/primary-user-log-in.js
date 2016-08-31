const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');

const mockData = require('../mock-data.js');

// TODO: Route should be authed

tape('set up db: add organisation, add primary user to that organisation', t => {
  t.plan(2);
  client.RPUSH('organisations', JSON.stringify(mockData.orgPostUser), (error, response) => {
    t.ok(response, 'adding an organisation: response from redis is ' + response);
    client.RPUSH('people', JSON.stringify(mockData.usersActivateDB), (error, response) => {
      t.ok(response, 'adding a primary user: response from redis is ' + response);
      t.end();
    });
  });
});

tape('/login post logs a user in, and returns the relevant information', t => {
  const options = {
    method: 'POST',
    url: '/login',
    payload: JSON.stringify(mockData.loginPrimaryUser)
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.end();
  });
});

tape.onFinish(() => {
  client.FLUSHDB();
  process.exit(0);
});
