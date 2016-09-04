const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');
const mockData = require('../helpers/mock-data.js');

const setup = require('../helpers/set-up.js');

// TODO: Route should be authed

tape('set up db: add organisation, add primary user to that organisation', t => {
  setup.initialiseDB(t.end);
});

tape('/login load page', t => {
  t.plan(1);
  const options = {
    method: 'GET',
    url: '/login'
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.end();
  });
});

tape('/login admin successful', t => {
  t.plan(2);
  const options = {
    method: 'POST',
    url: '/login',
    payload: JSON.stringify(mockData.loginAdminCorrect)
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 302, 'log in credentials are correct and user gets redirected to homepage');
    t.ok(reply.headers['set-cookie'], 'cookie has been set');
    t.end();
  });
});

tape('/login post logs a user in with incorrect credentials', t => {
  const options = {
    method: 'POST',
    url: '/login',
    payload: JSON.stringify(mockData.loginAdminIncorrect)
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 404, 'log in credentials are incorrect');
    t.end();
  });
});

tape('teardown', t => {
  client.FLUSHDB();
  client.end(true);
  server.stop(() => {});
  t.end();
});
