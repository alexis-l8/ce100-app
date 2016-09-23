var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var setup = require('../helpers/set-up.js');

var jwt = require('jsonwebtoken');
var sessions = require('../helpers/setup/sessions.js')['sessions'];
var primary_token = jwt.sign(sessions[2], process.env.JWT_SECRET);
var admin_token = jwt.sign(sessions[0], process.env.JWT_SECRET);

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('/people quick contact list page loads for primary user', t => {
  var options = {
    method: 'GET',
    url: '/people',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.ok(reply.payload.indexOf('Ben Matthews') > -1, 'route serves up list of users');
    t.equal(reply.payload.indexOf('Marie Kasai'), -1, 'primary user cannot view admins on quick contact list');
    t.equal(reply.payload.indexOf('Coco'), -1, 'primary user cannot view inactive primary users on quick contact list');
    t.equal(reply.payload.indexOf('/people/3/edit'), -1, 'primary user cannot see the edit button on quick contact list');
    t.end();
  });
});

tape('/people quick contact list page loads for admin', t => {
  var options = {
    method: 'GET',
    url: '/people',
    headers: { cookie: `token=${admin_token}` }
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.ok(reply.payload.indexOf('Ben Matthews') > -1, 'route serves up list of users');
    t.ok(reply.payload.indexOf('Marie Kasai') > -1, 'admin can view admins on quick contact list');
    t.ok(reply.payload.indexOf('Coco') > -1, 'admin can view inactive admins on quick contact list');
    t.ok(reply.payload.indexOf('/people/3/edit') > -1, 'admin can see the edit button on quick contact list');
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
