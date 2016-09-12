var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var setup = require('../helpers/set-up.js');

var jwt = require('jsonwebtoken');
var setupData = require('../helpers/setup-data.js');
var admin_token = jwt.sign(setupData.initialSessions[0], process.env.JWT_SECRET);
var primary_token = jwt.sign(setupData.initialSessions[2], process.env.JWT_SECRET);

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('root (dashboard) page loads', t => {
  var options = {
    method: 'GET',
    url: '/',
    headers: { cookie: `token=${admin_token}` }
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
