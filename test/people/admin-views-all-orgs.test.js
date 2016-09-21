var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var jwt = require('jsonwebtoken');

var setup = require('../helpers/set-up.js');
var setupData = require('../helpers/setup-data.js');
var admin_token = jwt.sign(setupData.initialSessions[0], process.env.JWT_SECRET);
var primary_token = jwt.sign(setupData.initialSessions[2], process.env.JWT_SECRET);

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('/orgs load general view', t => {
  var options = {
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

tape('/orgs load specific organisation page for org with primary user', t => {
  var options = {
    method: 'GET',
    url: '/orgs/0',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.end();
  });
});

tape('/orgs load specific organisation page for org _without_ primary user', t => {
  var options = {
    method: 'GET',
    url: '/orgs/5',
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
