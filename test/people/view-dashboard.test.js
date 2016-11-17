var tape = require('tape');
var client = require('redis').createClient();
var setup = require('../helpers/set-up.js');

var jwt = require('jsonwebtoken');
var sessions = require('../helpers/setup/sessions.js')['sessions'];
var admin_token = jwt.sign(sessions[0], process.env.JWT_SECRET);
var server;

tape('set up: initialise db', t => {
  setup.initialiseDB(function (initServer) {
    server = initServer;
    t.end();
  });
});

tape('root (dashboard) page loads', t => {
  var options = {
    method: 'GET',
    url: '/',
    headers: { cookie: `token=${admin_token}` }
  };
  server.inject(options, reply => {
    // TODO: CAN CHANGE WHEN WE MAKE A DASHBOARD
    t.equal(reply.statusCode, 302, 'route redircts to /orgs');
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
