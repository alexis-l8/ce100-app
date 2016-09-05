const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');
const setup = require('../helpers/set-up.js');

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('/people page loads', t => {
  const options = {
    method: 'GET',
    url: '/people',
    headers: { cookie: process.env.PRIMARY_COOKIE }
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.ok(reply.payload.indexOf('Marie Kasai') > -1, 'route serves up list of users');
    t.end();
  });
});

tape('teardown', t => {
  client.FLUSHDB();
  t.end();
});

tape.onFinish(() => {
  process.exit(0);
});
