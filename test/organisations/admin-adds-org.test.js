var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var payloads = require('../helpers/mock-payloads.js');
var setup = require('../helpers/set-up.js');

var jwt = require('jsonwebtoken');
var sessions = require('../helpers/setup/sessions.js')['sessions'];
var admin_token = jwt.sign(sessions[0], process.env.JWT_SECRET);
var primary_token = jwt.sign(sessions[2], process.env.JWT_SECRET);

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('orgs/add view', t => {
  t.plan(2);
  var adminCookie = {
    method: 'GET',
    url: '/orgs/add',
    headers: { cookie: `token=${admin_token}` }
  };
  var primaryCookie = {
    method: 'GET',
    url: '/orgs/add',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(primaryCookie, reply => {
    t.equal(reply.statusCode, 403, 'unauthorised user cannot access the route');
    server.inject(adminCookie, reply => {
      t.equal(reply.statusCode, 200, 'admin can access the route');
      t.end();
    });
  });
});

tape('orgs/add admin adds a new organisation', t => {
  t.plan(3);
  var options = {
    method: 'POST',
    url: '/orgs/add',
    payload: JSON.stringify(payloads.orgsAddPayload),
    headers: { cookie: `token=${admin_token}` }
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 302, 'admin is redirected');
    var url = reply.headers.location;
    t.ok(url === ('/orgs'), 'redirected to the new organisations view');
    var options2 = {
      method: 'GET',
      url: '/orgs',
      headers: { cookie: `token=${admin_token}` }
    };
    server.inject(options2, reply => {
      t.ok(reply.payload.indexOf(payloads.orgsAddPayload.name) > -1, 'mock organisation was added');
      t.end();
    });
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
