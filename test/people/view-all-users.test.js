const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');
const setup = require('../helpers/set-up.js');

var jwt = require('jsonwebtoken');
var admin_token = jwt.sign({userId: 0}, process.env.JWT_SECRET);
var primary_token = jwt.sign({userId: 2}, process.env.JWT_SECRET);

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('/people page loads', t => {
  const options = {
    method: 'GET',
    url: '/people',
    headers: { cookie: `token=${primary_token}` }
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
  client.end(true);
  server.stop(() => {});
});
