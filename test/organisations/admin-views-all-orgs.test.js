const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');

const setup = require('../helpers/set-up.js');
const setupData = require('../helpers/setup-data.js');

var jwt = require('jsonwebtoken');
var admin_token = jwt.sign({userId: 0}, process.env.JWT_SECRET);
var primary_token = jwt.sign({userId: 2}, process.env.JWT_SECRET);


tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('/orgs load general view', t => {
  const options = {
    method: 'GET',
    url: '/orgs',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.ok(reply.payload.indexOf(setupData.initialOrgs[0].name), 'organisations have been displayed');
    t.end();
  });
});

tape('/orgs/0 load specific organisation page', t => {
  const options = {
    method: 'GET',
    url: '/orgs/0',
    headers: { cookie: `token=${primary_token}` }
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
