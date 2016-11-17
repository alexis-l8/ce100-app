var tape = require('tape');
var client = require('redis').createClient();
var payloads = require('../helpers/mock-payloads.js');
var setup = require('../helpers/set-up.js');

var jwt = require('jsonwebtoken');
var sessions = require('../helpers/setup/sessions.js')['sessions'];
var admin_token = jwt.sign(sessions[0], process.env.JWT_SECRET);
var primary_token = jwt.sign(sessions[2], process.env.JWT_SECRET);
var server;

tape('set up: initialise db', t => {
  setup.initialiseDB(function (initServer) {
    server = initServer;
    t.end();
  });
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
  server.inject(primaryCookie, res => {
    t.equal(res.statusCode, 403, 'unauthorised user cannot access the route');
    server.inject(adminCookie, res => {
      t.equal(res.statusCode, 200, 'admin can access the route');
      t.end();
    });
  });
});

tape('orgs/add admin adds a new organisation', t => {
  var noName = {
    method: 'POST',
    url: '/orgs/add',
    payload: {name: ''},
    headers: { cookie: `token=${admin_token}` }
  }
  var options = {
    method: 'POST',
    url: '/orgs/add',
    payload: JSON.stringify(payloads.orgsAddPayload),
    headers: { cookie: `token=${admin_token}` }
  };
  var options2 = {
    method: 'GET',
    url: '/orgs',
    headers: { cookie: `token=${admin_token}` }
  };
  server.inject(noName, res => {
    t.equal(res.statusCode, 401, 'failing validation returns status code 401');
    t.ok(res.payload.indexOf('name is not allowed to be empty') > -1, 'if admin fails validation we show them appropriate message: "name is not allowed to be empty"');
    server.inject(options, res => {
      t.equal(res.statusCode, 302, 'admin is redirected');
      var url = res.headers.location;
      t.ok(url === ('/orgs'), 'redirected to the new organisations view');
      server.inject(options2, res => {
        t.ok(res.payload.indexOf(payloads.orgsAddPayload.name) > -1, 'mock organisation was added');
        t.end();
      });
    });
  })
});

tape('teardown', t => {
  client.FLUSHDB();
  t.end();
});

tape.onFinish(() => {
  client.end(true);
  server.stop(() => {});
});
