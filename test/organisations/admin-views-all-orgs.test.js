const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');

const setup = require('../helpers/set-up.js');

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('/orgs load general view', t => {
  const options = {
    method: 'GET',
    url: '/orgs',
    headers: { cookie: process.env.PRIMARY_COOKIE }
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.end();
  });
});

tape('/orgs/0 load specific organisation page', t => {
  const options = {
    method: 'GET',
    url: '/orgs/0',
    headers: { cookie: process.env.PRIMARY_COOKIE }
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.end();
  });
});

tape('teardown', t => {
  client.FLUSHDB();
  t.end();
});

tape.onFinish(() => {
  client.end(true);
  server.stop(() => {});
});
